import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { RedactionSchema } from "./schemas";
import { promptTemplate } from "./prompts";

const responseFormat = z.array(RedactionSchema, {
  description: "The list of PII detected in the text",
});

type PiiAgentResponse = z.infer<typeof responseFormat>;

export async function callPiiAgent(text: string): Promise<PiiAgentResponse> {
  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.1",
  });

  const structuredLlm = model.withStructuredOutput(responseFormat);
  const prompt = await promptTemplate.invoke({ TEXT: text });
  console.debug("Prompting LLM:", prompt.toString());
  const response = await structuredLlm.invoke(prompt);
  console.debug("LLM response:", response);
  return response;
}
