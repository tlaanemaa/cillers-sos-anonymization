"use client";

import { useState } from "react";
import { DocumentMagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Redaction } from "@/ai/schemas";
import { GroundTruthPII } from "@/app/store/evaluationStore";

interface ComparisonViewerProps {
  document: string;
  groundTruth: GroundTruthPII[];
  aiDetections: Redaction[];
}

export default function ComparisonViewer({
  document,
  groundTruth,
  aiDetections,
}: ComparisonViewerProps) {
  const [showLabels, setShowLabels] = useState(true);
  
  if (!document) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No document available for comparison</p>
          </div>
        </div>
      </div>
    );
  }

  const highlightDocument = () => {
    if (!document) return document;

    // Combined list of all highlights, with origin info
    const allHighlights = [
      ...groundTruth.map(gt => ({
        start: gt.start,
        end: gt.end,
        type: gt.type,
        origin: 'ground-truth' as const,
        id: gt.id
      })),
      ...aiDetections.map(detection => ({
        start: detection.start,
        end: detection.end,
        type: detection.type,
        origin: 'ai-detection' as const,
        id: detection.id,
        confidence: detection.confidence
      }))
    ].sort((a, b) => a.start - b.start);
    
    // Build the highlighted text
    const result = [];
    let lastIndex = 0;
    
    for (const highlight of allHighlights) {
      // Add text before this highlight
      if (lastIndex < highlight.start) {
        result.push(document.substring(lastIndex, highlight.start));
      }
      
      // Determine highlight class based on origin
      let highlightClass = '';
      let tooltipContent = '';
      
      if (highlight.origin === 'ground-truth') {
        // Check if this ground truth was also detected by AI
        const wasDetected = aiDetections.some(
          detection => 
            (detection.start === highlight.start && detection.end === highlight.end) ||
            // Also check for significant overlap
            (Math.max(0, Math.min(detection.end, highlight.end) - Math.max(detection.start, highlight.start)) > 
              0.8 * Math.min((detection.end - detection.start), (highlight.end - highlight.start)))
        );
        
        if (wasDetected) {
          // True positive
          highlightClass = 'bg-green-500/30 text-green-200 border border-green-700/40';
          tooltipContent = `✓ Correctly Detected: ${highlight.type}`;
        } else {
          // False negative
          highlightClass = 'bg-red-500/30 text-red-200 border border-red-700/40';
          tooltipContent = `✗ Missed Detection: ${highlight.type}`;
        }
      } else {
        // Check if this AI detection matches any ground truth
        const matchesGroundTruth = groundTruth.some(
          gt => 
            (gt.start === highlight.start && gt.end === highlight.end) ||
            // Also check for significant overlap
            (Math.max(0, Math.min(gt.end, highlight.end) - Math.max(gt.start, highlight.start)) > 
              0.8 * Math.min((gt.end - gt.start), (highlight.end - highlight.start)))
        );
        
        if (matchesGroundTruth) {
          // True positive (already highlighted by ground truth logic)
          continue;
        } else {
          // False positive
          highlightClass = 'bg-yellow-500/30 text-yellow-200 border border-yellow-700/40';
          tooltipContent = `! False Positive: ${highlight.type}${highlight.confidence ? ` (${(highlight.confidence * 100).toFixed(0)}%)` : ''}`;
        }
      }
      
      // Add the highlighted text
      const highlightedText = document.substring(highlight.start, highlight.end);
      result.push(
        `<mark class="${highlightClass} px-1 rounded relative group">
          ${highlightedText}
          ${showLabels ? 
            `<span class="absolute top-0 -translate-y-full left-0 bg-gray-800 text-xs px-2 py-1 rounded 
              text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
              ${tooltipContent}
            </span>` 
            : ''
          }
        </mark>`
      );
      
      lastIndex = highlight.end;
    }
    
    // Add any remaining text
    if (lastIndex < document.length) {
      result.push(document.substring(lastIndex));
    }
    
    return result.join('');
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2 text-sky-500" />
          Detection Comparison
        </h3>
        
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md border border-gray-700 flex items-center"
        >
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          {showLabels ? "Hide Labels" : "Show Labels"}
        </button>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-green-500/30 border border-green-700/40 rounded mr-2"></span>
          <span className="text-sm text-gray-300">True Positives</span>
        </div>
        
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-red-500/30 border border-red-700/40 rounded mr-2"></span>
          <span className="text-sm text-gray-300">False Negatives (Missed)</span>
        </div>
        
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 bg-yellow-500/30 border border-yellow-700/40 rounded mr-2"></span>
          <span className="text-sm text-gray-300">False Positives</span>
        </div>
      </div>
      
      <div className="bg-gray-950 rounded p-4 border border-gray-800 max-h-[600px] overflow-auto">
        <div 
          className="whitespace-pre-wrap font-mono text-sm text-gray-300"
          dangerouslySetInnerHTML={{ __html: highlightDocument() }}
        ></div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-400">
          <span className="text-green-500 font-medium">{
            groundTruth.filter(gt => 
              aiDetections.some(detection => 
                // Check for exact match or significant overlap
                (detection.start === gt.start && detection.end === gt.end) ||
                // Also check for significant overlap
                (Math.max(0, Math.min(detection.end, gt.end) - Math.max(detection.start, gt.start)) > 
                  0.8 * Math.min((detection.end - detection.start), (gt.end - gt.start)))
              )
            ).length
          }</span> correct detections
        </div>
        
        <div className="text-gray-400 text-right">
          <span className="text-red-500 font-medium">{
            groundTruth.filter(gt => 
              !aiDetections.some(detection => 
                // Check for exact match or significant overlap
                (detection.start === gt.start && detection.end === gt.end) ||
                // Also check for significant overlap
                (Math.max(0, Math.min(detection.end, gt.end) - Math.max(detection.start, gt.start)) > 
                  0.8 * Math.min((detection.end - detection.start), (gt.end - gt.start)))
              )
            ).length
          }</span> missed detections
        </div>
      </div>
    </div>
  );
} 
