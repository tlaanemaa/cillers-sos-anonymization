import { useState, useEffect, useRef, useCallback } from 'react';
import { PIIDetection } from '@/app/store/documentStore';
import HighlightedText from './HighlightedText';
import RedactedText from './RedactedText';
import { BoltIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  
  // Log for debugging
  useEffect(() => {
    console.log('TextHighlighter rendered with:', { 
      textLength: text?.length, 
      detectionsCount: detections?.length,
      isAnonymized 
    });
  }, [text, detections, isAnonymized]);
  
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
    
    // Get the selected text
    const selectedText = range.toString();
    if (!selectedText || selectedText.trim() === '') return;
    
    // Find the position in the original text
    try {
      // Get the text content of the container
      const containerText = container.textContent || '';
      
      // Get the text before the selection
      const textBeforeSelection = window.getSelection()?.anchorNode?.textContent?.substring(0, window.getSelection()?.anchorOffset || 0) || '';
      
      // Find all occurrences of the selected text in the original text
      const allMatches = [...containerText.matchAll(new RegExp(selectedText, 'g'))];
      
      if (allMatches.length > 0) {
        // Use the first match as a fallback
        let startOffset = allMatches[0].index;
        
        // Try to find the closest match to where the user selected
        const precedingText = containerText.substring(0, containerText.indexOf(textBeforeSelection) + textBeforeSelection.length);
        const closestMatch = allMatches.reduce((closest, match) => {
          const distance = Math.abs(match.index - precedingText.length);
          return distance < Math.abs(closest.index - precedingText.length) ? match : closest;
        }, allMatches[0]);
        
        startOffset = closestMatch.index;
        const endOffset = startOffset + selectedText.length;
        
        console.log('Selection made:', { 
          startOffset, 
          endOffset,
          selectedText
        });
        
        setSelection({ start: startOffset, end: endOffset });
      }
    } catch (error) {
      console.error("Error calculating selection:", error);
    }
  }, [isAnonymized]);
  
  // Function to confirm adding a custom highlight
  const confirmAddHighlight = useCallback(() => {
    if (selection) {
      console.log('Adding highlight:', selection);
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
          segments.push(
            <HighlightedText
              key={`highlight-${detection.id}`}
              text={detectionText}
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
        className="whitespace-pre-wrap font-mono text-sm p-4 min-h-[300px] max-h-[600px] overflow-auto text-slate-200"
        onMouseUp={handleMouseUp}
      >
        {renderedText}
      </div>
      
      {/* Selection confirmation dialog */}
      {selection && (
        <div className="absolute bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/30 z-50">
          <p className="mb-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 text-sm font-medium flex items-center">
            <BoltIcon className="w-4 h-4 mr-3 text-sky-400" />
            Add custom highlight?
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmAddHighlight}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-4 h-4 mr-2 hover:scale-110 transition-transform" />
              <span>Add</span>
            </button>
            <button
              onClick={cancelAddHighlight}
              className="bg-gray-700 hover:bg-gray-600 text-slate-200 px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center"
            >
              <XMarkIcon className="w-4 h-4 mr-2 hover:scale-110 transition-transform" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
