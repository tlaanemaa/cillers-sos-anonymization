"use server";

import { Redaction } from "./schemas";
import { mockDetectPII } from "./mock";

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
