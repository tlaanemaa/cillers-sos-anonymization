"use server";

import { PiiType, Redaction } from "./schemas";
// import { callPiiAgent } from "./agent";
//import { mockDetectPII } from "./mock";
import { callPiiAgent } from "./bartAgent";

export async function detectPII(
  input: string,
  risk_tolerance: number,
  piiTypesToDetect: PiiType[] = [],
  freeTextInput: string = ""
): Promise<Redaction[]> {
  const bounded_risk_tolerance = Math.min(Math.max(risk_tolerance, 0), 1);

  // const redactions = await callPiiAgent(input, piiTypesToDetect, freeTextInput);
  const redactions = await callPiiAgent(input, piiTypesToDetect, freeTextInput);

  return redactions.filter(
    // Low risk tolerance (0) → "Conservative" → detects more potential PII (low confidence threshold)
    // High risk tolerance (1) → "Aggressive" → focuses on high-confidence PII only (high confidence threshold)
    (redaction) => {
      // Filter by confidence threshold
      const meetsConfidenceThreshold =
        redaction.confidence >= bounded_risk_tolerance;

      // If piiTypesToDetect is empty, don't filter by type
      const typeFilter =
        piiTypesToDetect.length === 0 ||
        piiTypesToDetect.includes(redaction.type);

      return meetsConfidenceThreshold && typeFilter;
    }
  );
}
