import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PII_TYPES, PiiType, Redaction } from "./schemas";
import { promptTemplate } from "./prompts";
import { v4 as uuidv4 } from 'uuid';

// Simple schema that only requires the AI to identify the text to redact
const simpleResponseFormat = z.object({
    wordsToRedact: z.array(
        z.object({
            text: z.string().describe("The exact text that should be redacted"),
            confidence: z.number().describe("The confidence score of the redaction").min(0).max(1),
            type: z.enum(PII_TYPES).describe("The type of the redaction")
        }),
        {
            description: "The list of text items that should be redacted from the content"
        }
    )
})

type SimpleResponse = z.infer<typeof simpleResponseFormat>;
type RedactionMatch = { text: string; index: number; length: number };

/**
 * Main function to call the PII detection agent
 */
export async function callPiiAgent(
    text: string,
    piiTypesToDetect: PiiType[] = [],
    freeTextInput: string = ""
): Promise<Redaction[]> {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
    });

    // Get the AI response with just the simple list of words to redact
    const simpleResponse = await getAiDetectedItems(model, text, piiTypesToDetect, freeTextInput);

    // Convert simple response to full redaction schema with indexes
    const redactions = convertToRedactionSchema(text, simpleResponse.wordsToRedact);

    return redactions;
}

/**
 * Get the list of items to redact from the AI
 */
async function getAiDetectedItems(
    model: ChatGoogleGenerativeAI,
    text: string,
    piiTypesToDetect: PiiType[],
    freeTextInput: string
): Promise<SimpleResponse> {
    const structuredLlm = model.withStructuredOutput(simpleResponseFormat);

    const prompt = await promptTemplate.invoke({
        TEXT: text,
        PII_TYPES:
            piiTypesToDetect.length > 0 ? piiTypesToDetect.join(", ") : "all",
        FREE_TEXT: freeTextInput,
    });
    console.debug("Prompting LLM:", prompt.toString());

    // Get the simple response with just the text to redact
    const simpleResponse = await structuredLlm.invoke(prompt);
    console.debug("LLM simple response:", simpleResponse);

    return simpleResponse;
}

/**
 * Converts a list of words to redact into full redaction schema objects with start/end indexes
 */
function convertToRedactionSchema(
    sourceText: string,
    wordsToRedact: SimpleResponse["wordsToRedact"]
): Redaction[] {
    const redactions: Redaction[] = [];

    for (const item of wordsToRedact) {
        // Find all occurrences of this text in the source
        const matches = findAllOccurrences(sourceText, item.text);

        // Create redaction entries for each match
        for (const match of matches) {
            redactions.push(createRedactionObject(match, item));
        }
    }

    return redactions;
}

/**
 * Find all occurrences of a text in the source string
 */
function findAllOccurrences(sourceText: string, textToFind: string): RedactionMatch[] {
    const matches: RedactionMatch[] = [];
    const regex = new RegExp(`\\b${escapeRegExp(textToFind)}\\b`, 'g');
    let match;

    while ((match = regex.exec(sourceText)) !== null) {
        matches.push({
            text: textToFind,
            index: match.index,
            length: textToFind.length
        });
    }

    return matches;
}

/**
 * Create a redaction object for a matched item
 */
function createRedactionObject(match: RedactionMatch, item: SimpleResponse["wordsToRedact"][number]): Redaction {
    return {
        text: match.text,
        start: match.index,
        end: match.index + match.length,
        type: item.type || "other",
        id: uuidv4(),
        confidence: item.confidence,
        replacement: generateReplacement(match.length)
    };
}

/**
 * Generate a replacement string (white blocks) of the specified length
 */
function generateReplacement(length: number): string {
    return '█'.repeat(length);
}

/**
 * Helper function to escape special characters in regex
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
