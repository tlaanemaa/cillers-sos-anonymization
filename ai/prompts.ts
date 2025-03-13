import { ChatPromptTemplate } from "@langchain/core/prompts";

const SYSTEM_PROMPT = `
You are a personally identifiable information (PII) detection agent.
`;


const TASK_PROMPT = `
Detect personally identifiable information (PII) in the following text:
<text>
{TEXT}
</text>

PII types to detect: {PII_TYPES}

Additional context: {FREE_TEXT}

Please return the list of PII detected in the text. Return at least 2 items in the list!
`;

const SHORT_PROMPT = `
Identify all personally identifiable information (PII) in this text:

<text>
{text}
</text>

Consider both direct identifiers (names, emails, phone numbers) and indirect identifiers (unique characteristics, rare combinations of traits, specific locations/times).

Examples:
1. "John (john.doe@email.com) works at XYZ Corp."
   → {"PIIs": ["John", "john.doe@email.com", "XYZ Corp"]}

2. "The only female professor in the department who drives a red Tesla."
   → {"PIIs": ["only female professor in the department", "drives a red Tesla"]}

3. "The patient with the rare condition that affects 1 in 10,000 people."
   → {"PIIs": ["patient with the rare condition that affects 1 in 10,000 people"]}

Analyze methodically and return only this JSON format:
{"PIIs": [list of identified PII strings]}

If no PII is found, return {"PIIs": []}
`

export const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_PROMPT.trim()],
  ["user", TASK_PROMPT.trim()],
]);
