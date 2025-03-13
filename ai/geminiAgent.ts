import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PiiType, RedactionSchema } from "./schemas";
import { promptTemplate } from "./prompts";

const responseFormat = z.array(RedactionSchema, {
    description: "The list of PII detected in the text",
});

type PiiAgentResponse = z.infer<typeof responseFormat>;

export async function callPiiAgent(
    text: string,
    piiTypesToDetect: PiiType[] = [],
    freeTextInput: string = ""
): Promise<PiiAgentResponse> {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
    });

    const structuredLlm = model.withStructuredOutput(responseFormat);
    const prompt = await promptTemplate.invoke({
        TEXT: text,
        PII_TYPES:
            piiTypesToDetect.length > 0 ? piiTypesToDetect.join(", ") : "all",
        FREE_TEXT: freeTextInput,
    });
    console.debug("Prompting LLM:", prompt.toString());
    const response = await structuredLlm.invoke(prompt);
    console.debug("LLM response:", response);
    return response;
}
