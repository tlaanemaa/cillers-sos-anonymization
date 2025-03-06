import { useState, useEffect, useRef, useCallback } from 'react';
import { PIIDetection } from '@/app/store/documentStore';
import HighlightedText from './HighlightedText';
import RedactedText from './RedactedText';

interface TextHighlighterProps {
  text: string;
  detections: PIIDetection[];
  isAnonymized: boolean;
  onAddHighlight: (start: number, end: number) => void;
  onRemoveHighlight: (id: string) => void;
}

export default function TextHighlighter({
  text,
  detections,
  isAnonymized,
  onAddHighlight,
  onRemoveHighlight
}: TextHighlighterProps) {
  const [renderedText, setRenderedText] = useState<React.ReactNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const prevDetectionsRef = useRef<string[]>([]);
  
  // Function to handle user text selection for custom highlighting
  const handleMouseUp = useCallback(() => {
    if (isAnonymized) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    // Calculate text offsets
    const container = containerRef.current;
    if (!container) return;
    
    // Get the start and end offsets in the text
    try {
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(container);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const startOffset = preSelectionRange.toString().length;
      
      const endOffset = startOffset + range.toString().length;
      
      if (startOffset !== endOffset) {
        setSelection({ start: startOffset, end: endOffset });
      }
    } catch (error) {
      console.error("Error calculating selection:", error);
    }
  }, [isAnonymized]);
  
  // Function to confirm adding a custom highlight
  const confirmAddHighlight = useCallback(() => {
    if (selection) {
      onAddHighlight(selection.start, selection.end);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  }, [selection, onAddHighlight]);
  
  // Function to cancel adding a custom highlight
  const cancelAddHighlight = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Render the text with highlights
  useEffect(() => {
    if (!text) {
      setRenderedText([]);
      return;
    }
    
    try {
      // Sort detections by start position
      const sortedDetections = [...detections].sort((a, b) => a.start - b.start);
      
      // Create an array of text segments with or without highlights
      const segments: React.ReactNode[] = [];
      let lastIndex = 0;
      
      // Get previous detection IDs for comparison
      const currentDetectionIds = detections.map(d => d.id);
      const prevDetectionIds = prevDetectionsRef.current;
      
      sortedDetections.forEach((detection) => {
        // Validate detection boundaries
        if (detection.start < 0 || detection.end > text.length || detection.start >= detection.end) {
          console.warn("Invalid detection boundaries:", detection);
          return;
        }
        
        // Add text before this detection
        if (lastIndex < detection.start) {
          segments.push(
            <span key={`text-${lastIndex}`}>
              {text.substring(lastIndex, detection.start)}
            </span>
          );
        }
        
        // Add the highlighted or redacted text
        const detectionText = text.substring(detection.start, detection.end);
        
        if (isAnonymized) {
          // If anonymized, show redacted text
          segments.push(
            <RedactedText 
              key={`anonymized-${detection.id}`} 
              length={detection.end - detection.start} 
            />
          );
        } else {
          // If not anonymized, show highlighted text
          // Check if this is a new detection
          const isNewDetection = !prevDetectionIds.includes(detection.id);
          
          segments.push(
            <HighlightedText
              key={`highlight-${detection.id}`}
              text={detectionText}
              isNew={isNewDetection}
              onRemove={() => onRemoveHighlight(detection.id)}
            />
          );
        }
        
        lastIndex = detection.end;
      });
      
      // Add the remaining text
      if (lastIndex < text.length) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex)}
          </span>
        );
      }
      
      setRenderedText(segments);
      
      // Update the previous detections reference
      prevDetectionsRef.current = currentDetectionIds;
    } catch (error) {
      console.error("Error rendering text:", error);
      // Fallback to plain text if there's an error
      setRenderedText([<span key="fallback">{text}</span>]);
    }
  }, [text, detections, isAnonymized, onRemoveHighlight]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 rounded min-h-[200px] max-h-[500px] overflow-auto"
        onMouseUp={handleMouseUp}
      >
        {renderedText}
      </div>
      
      {/* Selection confirmation dialog */}
      {selection && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-300 z-10">
          <p className="mb-2">Add custom highlight?</p>
          <div className="flex gap-2">
            <button
              onClick={confirmAddHighlight}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Add
            </button>
            <button
              onClick={cancelAddHighlight}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 