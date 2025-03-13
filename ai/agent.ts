import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
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
  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "gemma3:1b",
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
