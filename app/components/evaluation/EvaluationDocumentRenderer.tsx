"use client";

import { useMemo } from "react";
import SharedDocumentRenderer, { Highlight } from "../shared/document/DocumentRenderer";
import { Redaction } from "@/ai/schemas";
import { EyeIcon } from "@heroicons/react/24/outline";

export interface EvaluationDocumentRendererProps {
  document: string;
  groundTruth: Redaction[];
  aiDetections?: Redaction[];
  showComparison?: boolean;
  className?: string;
  height?: string;
}

/**
 * Minimum overlap percentage required to consider a detection matching with ground truth
 */
const MIN_OVERLAP_THRESHOLD = 0.8;

/**
 * Check if two spans overlap significantly
 */
function hasSignificantOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  if (!a || !b) return false;
  
  const overlap = Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  const aLength = a.end - a.start;
  const bLength = b.end - b.start;
  return overlap >= MIN_OVERLAP_THRESHOLD * Math.min(aLength, bLength);
}

/**
 * CSS classes for the different highlight types
 */
const HIGHLIGHT_CLASSES = {
  groundTruth: 'from-teal-500/20 to-teal-600/10 border-teal-700/30 text-teal-200',
  truePositive: 'from-green-500/20 to-green-600/10 border-green-700/30 text-green-200',
  falseNegative: 'from-red-500/20 to-red-600/10 border-red-700/30 text-red-200',
  falsePositive: 'from-yellow-500/20 to-yellow-600/10 border-yellow-700/30 text-yellow-200'
};

/**
 * Document renderer specialized for evaluation use cases
 * Extends the shared document renderer with comparison features
 */
export default function EvaluationDocumentRenderer({
  document,
  groundTruth,
  aiDetections = [],
  showComparison = true,
  className = "",
  height = "100%",
}: EvaluationDocumentRendererProps) {
  // Check for empty document
  if (!document) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-center text-gray-400">
        No document loaded. Please upload a document with ground truth PII tags.
      </div>
    );
  }

  // Create highlights for the document
  const highlights = useMemo(() => {
    // If not comparing, just show ground truth
    if (!showComparison || aiDetections.length === 0) {
      return groundTruth.map(gt => ({
        id: gt.id,
        start: gt.start,
        end: gt.end,
        text: gt.text || '',
        type: gt.type,
        className: HIGHLIGHT_CLASSES.groundTruth,
      }));
    }

    const highlights: Highlight[] = [];
    
    // First, add ground truth items and mark them as true positives or false negatives
    for (const gt of groundTruth) {
      const matchingDetection = aiDetections.find(d => hasSignificantOverlap(gt, d));
      
      if (matchingDetection) {
        // True positive - detected correctly
        highlights.push({
          id: `tp-${gt.id}`,
          start: gt.start,
          end: gt.end,
          text: gt.text || '',
          type: `${gt.type} (Detected)`,
          className: HIGHLIGHT_CLASSES.truePositive,
        });
      } else {
        // False negative - missed by AI
        highlights.push({
          id: `fn-${gt.id}`,
          start: gt.start,
          end: gt.end,
          text: gt.text || '',
          type: `${gt.type} (Missed)`,
          className: HIGHLIGHT_CLASSES.falseNegative,
        });
      }
    }
    
    // Then add false positives (AI detections that don't match ground truth)
    for (const detection of aiDetections) {
      const matchingGt = groundTruth.find(gt => hasSignificantOverlap(gt, detection));
      
      if (!matchingGt) {
        // False positive - incorrectly detected
        highlights.push({
          id: `fp-${detection.id}`,
          start: detection.start,
          end: detection.end,
          text: detection.text || '',
          type: `${detection.type} (False Positive)`,
          confidence: detection.confidence,
          className: HIGHLIGHT_CLASSES.falsePositive,
        });
      }
    }
    
    // Sort by start position for better rendering performance
    return highlights.sort((a, b) => a.start - b.start);
  }, [document, groundTruth, aiDetections, showComparison]);

  // Create header content with comparison toggle information
  const headerContent = useMemo(() => {
    if (!showComparison || aiDetections.length === 0) {
      return (
        <div className="flex items-center text-xs bg-indigo-900/40 border border-indigo-800/40 px-2 py-1 rounded-full text-indigo-300">
          <EyeIcon className="w-3 h-3 mr-1" />
          Showing Ground Truth ({groundTruth.length} items)
        </div>
      );
    }
    
    // Count true positives, false negatives, and false positives
    const truePositives = highlights.filter(h => String(h.id).startsWith('tp-')).length;
    const falseNegatives = highlights.filter(h => String(h.id).startsWith('fn-')).length;
    const total = truePositives + falseNegatives;
    
    if (total === 0) return null;
    
    const detectionRate = (truePositives / total * 100).toFixed(0);
    
    return (
      <div className="flex items-center text-xs bg-green-900/40 border border-green-800/40 px-2 py-1 rounded-full text-green-300">
        <EyeIcon className="w-3 h-3 mr-1" />
        Comparison View: {truePositives}/{total} detected ({detectionRate}%)
      </div>
    );
  }, [highlights, showComparison, aiDetections, groundTruth.length]);
  
  // Determine subtitle based on state
  const subtitle = showComparison && aiDetections.length > 0 
    ? "Comparison View" 
    : "Ground Truth";

  return (
    <SharedDocumentRenderer
      text={document}
      highlights={highlights}
      title="Evaluation Document"
      subtitle={subtitle}
      headerContent={headerContent}
      className={`h-full ${className}`}
      showConfidence={true}
      height={height}
    />
  );
} 
