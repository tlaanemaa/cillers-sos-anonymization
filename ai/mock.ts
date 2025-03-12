import { Redaction } from "./schemas";
import { v4 as uuidv4 } from "uuid";

// Sample text for demonstration
export const SAMPLE_TEXT = `Hello, my name is John Smith and I live at 123 Main St, San Francisco, CA 94105. 
You can reach me at john.smith@example.com or call me at (555) 123-4567.
My social security number is 123-45-6789 and my credit card number is 4111-1111-1111-1111.
I was born on January 15, 1980 and my employee ID is EMP-12345.`;

/**
 * Detects personally identifiable information (PII) in the provided text
 *
 * @param text - The text to analyze for PII
 * @returns Array of detected PII elements
 */
export function mockDetectPII(text: string): Redaction[] {
  if (!text) return [];

  // Collection of patterns to detect
  const patterns = [
    { type: "name", regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g },
    {
      type: "address",
      regex: /\b\d+ [A-Za-z]+ St[\.,]? [A-Za-z]+, [A-Z]{2} \d{5}\b/g,
    },
    { type: "phone", regex: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
    { type: "email", regex: /\b[\w.-]+@[\w.-]+\.\w+\b/g },
    { type: "ip", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
    {
      type: "credit-card",
      regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    },
    { type: "other", regex: /\b\d{3}-\d{2}-\d{4}\b/g }, // SSN as "other" type
  ] as const;

  // Find matches for each pattern
  const detections: Redaction[] = [];

  patterns.forEach((pattern) => {
    // Create a new regex for each pattern to avoid lastIndex issues
    const regex = new RegExp(pattern.regex);
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Ensure we don't get stuck in an infinite loop
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
        continue;
      }

      // Validate match boundaries
      if (match.index < 0 || match.index + match[0].length > text.length) {
        continue;
      }

      detections.push({
        id: uuidv4(),
        type: pattern.type,
        confidence: Math.random() * 0.5 + 0.5,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });

  return detections;
}
