"use server";

import { Redaction } from "./schemas";
import { mockDetectPII } from "./mock";
/**
 * Detects PII in a given input string based on the risk tolerance.
 *
 * @param input - The input string to detect PII in.
 * @param risk_tolerance - The risk tolerance for the detection (0-1).
 * @returns An array of redactions representing the detected PII.
 */
export async function detectPII(
  input: string,
  risk_tolerance: number
): Promise<Redaction[]> {
  if (risk_tolerance < 0 || risk_tolerance > 1) {
    throw new Error("Risk tolerance must be between 0 and 1");
  }

  // TODO: implement the anonymization logic
  console.log("Anonymizing", input, risk_tolerance);
  return mockDetectPII(input);
}

/**
 * Applies redactions to the input text by replacing sensitive information with a redaction character.
 *
 * @param input - The original text to apply redactions to
 * @param redactions - Array of redactions to apply
 * @param redactionChar - Character(s) to use for redaction
 * @returns The redacted text with sensitive information replaced
 */
export function applyRedactions(
  input: string,
  redactions: Redaction[],
  redactionChar: string = "█"
): string {
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
