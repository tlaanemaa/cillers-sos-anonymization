import { detectPII } from "./detect";
import { applyRedactions } from "./redact";
import type { Redaction } from "./schemas";

export type { Redaction } from "./schemas";
export { SAMPLE_TEXT } from "./mock";

/**
 * Detects PII in a given input string based on the risk tolerance.
 * This function serves as a boundary between the UI and the AI layer.
 *
 * @param input - The input string to detect PII in.
 * @param risk_tolerance - The risk tolerance for the detection (0-1).
 * @returns An array of redactions representing the detected PII.
 */
export async function detect(
  input: string,
  risk_tolerance: number
): Promise<Redaction[]> {
  return detectPII(input, risk_tolerance);
}

/**
 * Applies redactions to a given input string based on an array of redactions.
 * This function serves as a boundary between the UI and the AI layer.
 *
 * @param input - The input string to apply redactions to.
 * @param redactions - An array of redactions to apply.
 * @returns The input string with the redactions applied.
 */
export async function redact(
  input: string,
  redactions: Redaction[]
): Promise<string> {
  return applyRedactions(input, redactions);
}
