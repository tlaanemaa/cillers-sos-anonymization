// "use server";

import { Redaction } from "./schemas";
import { callPiiAgent } from "./agent";
import { mockDetectPII } from "./mock";

export async function detectPII(
  input: string,
  risk_tolerance: number
): Promise<Redaction[]> {
  const bounded_risk_tolerance = Math.min(Math.max(risk_tolerance, 0), 1);

  // const redactions = await callPiiAgent(input);
  const redactions = mockDetectPII(input);
  return redactions.filter(
    (redaction) => redaction.confidence >= bounded_risk_tolerance
  );
}
