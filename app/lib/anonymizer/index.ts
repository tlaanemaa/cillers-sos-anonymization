import { PIIDetection } from "@/app/store/documentStore";

// Sample text for demonstration
export const SAMPLE_TEXT = `Hello, my name is John Smith and I live at 123 Main St, San Francisco, CA 94105. 
You can reach me at john.smith@example.com or call me at (555) 123-4567.
My social security number is 123-45-6789 and my credit card number is 4111-1111-1111-1111.
I was born on January 15, 1980 and my employee ID is EMP-12345.`;

/**
 * Detects personally identifiable information (PII) in the provided text
 */
export function detectPII(text: string): PIIDetection[] {
  if (!text) return [];
  
  // Collection of patterns to detect
  const patterns = [
    { type: "name", regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g },                    // Names like "John Smith"
    { type: "email", regex: /\b[\w.-]+@[\w.-]+\.\w+\b/g },                      // Email addresses
    { type: "phone", regex: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },       // Phone numbers
    { type: "address", regex: /\b\d+ [A-Za-z]+ St[\.,]? [A-Za-z]+, [A-Z]{2} \d{5}\b/g }, // Addresses
    { type: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },                           // Social Security Numbers
    { type: "cc", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },       // Credit Card Numbers
    { type: "dob", regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/g }, // Dates of Birth
    { type: "id", regex: /\b[A-Z]{3}-\d{5}\b/g }                                // Employee IDs
  ];
  
  // Find matches for each pattern
  const detections: PIIDetection[] = [];
  let idCounter = 1;
  
  patterns.forEach(pattern => {
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
        type: pattern.type,
        start: match.index,
        end: match.index + match[0].length,
        id: `${pattern.type}-${idCounter++}-${Date.now()}` // Add timestamp to ensure uniqueness
      });
    }
  });
  
  return detections;
}

/**
 * Anonymizes the text by replacing detected PII with black boxes
 */
export function anonymizeText(text: string, detections: PIIDetection[]): string {
  if (!text || !detections.length) return text;
  
  // Sort detections by start position in descending order
  // to avoid index shifting when replacing text
  const sortedDetections = [...detections].sort((a, b) => b.start - a.start);
  
  // Replace each detected segment with black boxes
  let anonymizedText = text;
  
  sortedDetections.forEach(detection => {
    // Validate detection boundaries
    if (detection.start < 0 || detection.end > text.length || detection.start >= detection.end) {
      console.warn("Invalid detection boundaries:", detection);
      return;
    }
    
    const length = detection.end - detection.start;
    const replacement = '█'.repeat(length);
    anonymizedText = anonymizedText.substring(0, detection.start) + replacement + anonymizedText.substring(detection.end);
  });
  
  return anonymizedText;
} 