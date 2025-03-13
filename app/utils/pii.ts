import { Redaction } from "@/ai/schemas";

export function createManualPiiDetection(text: string, start: number, end: number): Redaction {
  return {
    id: `manual-${Date.now()}`,
    type: "MANUAL_PII",
    start,
    end,
    confidence: 1.0,
    text: text.substring(start, end),
    replacement: "█".repeat(end - start),
  };
} 