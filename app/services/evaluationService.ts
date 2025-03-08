import { detect } from "@/ai";
import { Redaction } from "@/ai/schemas";
import { EvaluationMetrics } from "../store/evaluationStore";

/**
 * Minimum overlap percentage required to consider a detection matching with ground truth
 */
const MIN_OVERLAP_THRESHOLD = 0.8;

/**
 * Evaluate PII detection against ground truth
 */
export async function evaluateDetection(
  document: string,
  groundTruth: Redaction[],
  riskTolerance: number = 0.5
): Promise<{
  detections: Redaction[];
  metrics: EvaluationMetrics;
}> {
  if (!document) throw new Error("Document is required");
  if (!groundTruth.length) throw new Error("Ground truth PII is required");
  if (riskTolerance < 0 || riskTolerance > 1) throw new Error("Risk tolerance must be between 0 and 1");

  // Start timing
  const startTime = performance.now();
  
  // Run detection
  const detections = await detect(document, riskTolerance);
  
  // End timing
  const endTime = performance.now();
  const processingTime = (endTime - startTime) / 1000; // Convert to seconds
  
  // Calculate metrics
  const { accuracy, precision, recall, f1Score } = calculateMetrics(detections, groundTruth);
  
  return {
    detections,
    metrics: {
      accuracy,
      precision,
      recall,
      f1Score,
      processingTime,
    }
  };
}

/**
 * Calculate evaluation metrics based on detections and ground truth
 */
function calculateMetrics(
  detections: Redaction[],
  groundTruth: Redaction[]
): {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
} {
  // Count true positives, false positives, and false negatives
  let truePositives = 0;
  let falsePositives = 0;
  
  // Track which ground truth items have been matched
  const matchedGroundTruth = new Set<string>();
  
  // Check each detection against ground truth
  for (const detection of detections) {
    let matched = false;
    
    for (const gt of groundTruth) {
      if (hasSignificantOverlap(detection, gt) && !matchedGroundTruth.has(gt.id)) {
        matched = true;
        matchedGroundTruth.add(gt.id);
        truePositives++;
        break;
      }
    }
    
    if (!matched) {
      falsePositives++;
    }
  }
  
  const falseNegatives = groundTruth.length - matchedGroundTruth.size;
  
  // Calculate metrics
  const precision = calculatePrecision(truePositives, falsePositives);
  const recall = calculateRecall(truePositives, falseNegatives);
  const f1Score = calculateF1Score(precision, recall);
  const accuracy = calculateAccuracy(truePositives, falsePositives, falseNegatives);
  
  return { accuracy, precision, recall, f1Score };
}

/**
 * Check if two spans overlap significantly
 */
function hasSignificantOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number }
): boolean {
  const overlap = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  const aLength = a.end - a.start;
  const bLength = b.end - b.start;
  
  return overlap >= MIN_OVERLAP_THRESHOLD * Math.min(aLength, bLength);
}

/**
 * Calculate precision: TP / (TP + FP)
 */
function calculatePrecision(truePositives: number, falsePositives: number): number {
  return truePositives / (truePositives + falsePositives) * 100 || 0;
}

/**
 * Calculate recall: TP / (TP + FN)
 */
function calculateRecall(truePositives: number, falseNegatives: number): number {
  return truePositives / (truePositives + falseNegatives) * 100 || 0;
}

/**
 * Calculate F1 score: harmonic mean of precision and recall
 */
function calculateF1Score(precision: number, recall: number): number {
  return precision && recall ? 2 * (precision * recall) / (precision + recall) / 100 : 0;
}

/**
 * Calculate accuracy: TP / (TP + FP + FN)
 */
function calculateAccuracy(truePositives: number, falsePositives: number, falseNegatives: number): number {
  return truePositives / (truePositives + falsePositives + falseNegatives) * 100 || 0;
}

/**
 * Load and parse a text file with PII tags
 * Supports the format where PII is marked with <| and |> tags
 */
export async function loadAndParseTaggedText(file: File): Promise<{
  text: string;
  groundTruth: Redaction[];
}> {
  if (!file) throw new Error("File is required");
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }
        
        const taggedText = event.target.result as string;
        const { cleanText, piiEntities } = parseTaggedText(taggedText);
        
        resolve({
          text: cleanText,
          groundTruth: piiEntities
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse text with PII tags in the format <|PII text|>
 */
export function parseTaggedText(text: string): { 
  cleanText: string; 
  piiEntities: Redaction[]; 
} {
  if (!text) return { cleanText: "", piiEntities: [] };
  
  const piiEntities: Redaction[] = [];
  let cleanText = '';
  let lastIndex = 0;
  
  // Regular expression to find all PII tags
  const piiTagRegex = /<\|(.*?)\|>/g;
  let match;
  
  while ((match = piiTagRegex.exec(text)) !== null) {
    try {
      const fullMatch = match[0]; // The complete tagged text: <|PII text|>
      const piiContent = match[1].trim(); // Just the PII content: PII text
      
      if (piiContent === '') {
        // Skip empty tags
        continue;
      }
      
      const startPos = match.index;
      const endPos = startPos + fullMatch.length;
      
      // Add text before this tag to the clean text
      cleanText += text.substring(lastIndex, startPos);
      
      // Create a PII entity
      piiEntities.push({
        id: crypto.randomUUID(),
        type: inferPiiType(piiContent),
        confidence: 1.0, // Ground truth has 100% confidence
        start: cleanText.length,
        end: cleanText.length + piiContent.length,
        text: piiContent,
      });
      
      // Add the PII content to the clean text (without the tags)
      cleanText += piiContent;
      
      // Update the last index
      lastIndex = endPos;
    } catch (error) {
      console.error("Error processing PII tag:", error);
    }
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    cleanText += text.substring(lastIndex);
  }
  
  return { cleanText, piiEntities };
}

/**
 * Infer the type of PII based on content patterns
 */
function inferPiiType(content: string): "name" | "address" | "phone" | "email" | "ip" | "credit-card" | "other" | "MANUAL_PII" {
  // Email pattern
  if (/\S+@\S+\.\S+/.test(content)) {
    return 'email';
  }
  
  // Date patterns - these are not explicitly in the type, so return "other"
  if (/^\d{4}-\d{2}-\d{2}/.test(content) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(content)) {
    return 'other';
  }
  
  // Phone number patterns
  if (/^\+?[\d\s()-]{7,}$/.test(content)) {
    return 'phone';
  }
  
  // Person name - simple check for capitalized words
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(content)) {
    return 'name';
  }
  
  // Address pattern - simple check for multiple words
  if (/\d+\s+[A-Za-z\s,]+/.test(content)) {
    return 'address';
  }
  
  // Default
  return 'other';
} 
