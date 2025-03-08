import { Redaction } from "./schemas";

export async function applyRedactions(
  input: string,
  redactions: Redaction[],
  redactionChar: string = "█"
): Promise<string> {
  if (!input || !redactions.length) return input;

  // Sort redactions by start position to handle overlapping redactions
  const sortedRedactions = [...redactions].sort((a, b) => a.start - b.start);
  let redactedText = "";
  let lastIndex = 0;

  for (const redaction of sortedRedactions) {
    redactedText += input.substring(lastIndex, redaction.start);
    redactedText += redactionChar.repeat(redaction.end - redaction.start);
    lastIndex = redaction.end;
  }

  return redactedText + input.substring(lastIndex);
}
