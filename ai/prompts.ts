import { ChatPromptTemplate } from "@langchain/core/prompts";

const SYSTEM_PROMPT = `
You are a personally identifiable information (PII) detection agent.
`;

const TASK_PROMPT = `
Detect personally identifiable information (PII) in the following text:
<text>
{TEXT}
</text>

Please return the list of PII detected in the text. Return at least 2 items in the list!
`;

export const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT.trim()],
  ["user", TASK_PROMPT.trim()],
]);
