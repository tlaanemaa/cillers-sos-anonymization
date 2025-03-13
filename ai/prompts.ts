import { ChatPromptTemplate } from "@langchain/core/prompts";

const SYSTEM_PROMPT = `
You are a personally identifiable information (PII) detection agent. Users will upload documents and ask you to detect named entities and other types of sensitive information, which could be general or very strict depending on the use case. Return all the pieces of sensitive information, which is named entities of all types, and all strings of text that are detailed about a persons identity, unless custom instructions ask you to do somehting else. in this text, it can be words, names, places, dates, emails, phone numbers, even longer strings up to a sentence if all of is sensitive, and more. Be liberal and include all possible PII types, but also be accurate and only include the most relevant information. If you are unsure, it is better to include the information than to exclude it. Catch named entities, dates, numbers, years, names, indirect identifiers, and more. If you are unsure, it is better to include the information than to exclude it. Add everything that could be sensitive information, or that could be used if an intelligent agent tried to find this person or where they live or work or anything about them
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
