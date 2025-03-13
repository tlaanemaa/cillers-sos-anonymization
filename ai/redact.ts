import { Redaction } from "./schemas";

export async function applyRedactions(
  input: string,
  redactions: Redaction[],
  redactionChar: string = "█"
): Promise<string> {
  if (!input || !redactions.length) return input;

  // Sort redactions by start position
  const sortedRedactions = [...redactions].sort((a, b) => a.start - b.start);

  // Merge overlapping redactions to handle overlaps properly
  const mergedRedactions: Redaction[] = [];

  for (const redaction of sortedRedactions) {
    if (mergedRedactions.length === 0) {
      // First redaction, just add it
      mergedRedactions.push({ ...redaction });
      continue;
    }

    // Get the last redaction in our merged list
    const lastRedaction = mergedRedactions[mergedRedactions.length - 1];

    // Check if current redaction overlaps with the last merged redaction
    if (redaction.start <= lastRedaction.end) {
      // They overlap, extend the end position of the last redaction if needed
      lastRedaction.end = Math.max(lastRedaction.end, redaction.end);
    } else {
      // No overlap, add as a new redaction
      mergedRedactions.push({ ...redaction });
    }
  }

  // Apply the merged redactions
  let redactedText = "";
  let lastIndex = 0;

  for (const redaction of mergedRedactions) {
    redactedText += input.substring(lastIndex, redaction.start);
    // Use replacement if available, otherwise use redactionChar
    const replacement = redaction.replacement || redactionChar.repeat(redaction.end - redaction.start);
    redactedText += replacement;
    lastIndex = redaction.end;
  }

  return redactedText + input.substring(lastIndex);
}
