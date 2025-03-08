"use client";

import { useMemo, useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface Highlight {
  id: string;
  start: number;
  end: number;
  text?: string;
  type: string;
  confidence?: number;
  color?: string;
  className?: string;
  showRemoveButton?: boolean;
}

export interface DocumentRendererProps {
  text: string;
  highlights: Highlight[];
  title?: string;
  subtitle?: string;
  onHighlightClick?: (id: string) => void;
  onHighlightRemove?: (id: string) => void;
  headerContent?: ReactNode;
  className?: string;
  showConfidence?: boolean;
  height?: string;
}

export default function SharedDocumentRenderer({
  text,
  highlights,
  title = "Document",
  subtitle,
  onHighlightClick,
  onHighlightRemove,
  headerContent,
  className = "",
  showConfidence = false,
  height = "100%",
}: DocumentRendererProps) {
  const [isHoveringHighlight, setIsHoveringHighlight] = useState<string | null>(null);
  const [isPermanentHover, setIsPermanentHover] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create highlighted text with markup
  const highlightedContent = useMemo(() => {
    if (!text || !highlights.length) {
      return text;
    }

    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    
    // Build the highlighted text
    const result = [];
    let lastIndex = 0;
    
    for (let i = 0; i < sortedHighlights.length; i++) {
      const highlight = sortedHighlights[i];
      // Add text before this highlight
      if (lastIndex < highlight.start) {
        result.push(text.substring(lastIndex, highlight.start));
      }
      
      // Skip if highlight is beyond text bounds
      if (highlight.start >= text.length) continue;
      
      // Add the highlighted text with Framer Motion
      const highlightedText = text.substring(
        highlight.start, 
        Math.min(highlight.end, text.length)
      );
      
      // Default colors based on type if not provided
      const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
          case 'name': return 'from-pink-500/20 to-pink-600/10 border-pink-700/30 text-pink-200';
          case 'address': return 'from-blue-500/20 to-blue-600/10 border-blue-700/30 text-blue-200';
          case 'phone': return 'from-green-500/20 to-green-600/10 border-green-700/30 text-green-200';
          case 'email': return 'from-purple-500/20 to-purple-600/10 border-purple-700/30 text-purple-200';
          case 'date': return 'from-amber-500/20 to-amber-600/10 border-amber-700/30 text-amber-200';
          case 'language': return 'from-indigo-500/20 to-indigo-600/10 border-indigo-700/30 text-indigo-200';
          case 'year': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-700/30 text-yellow-200';
          case 'manual_pii': return 'from-red-500/20 to-red-600/10 border-red-700/30 text-red-200';
          case 'tagged-pii': return 'from-teal-500/20 to-teal-600/10 border-teal-700/30 text-teal-200';
          default: return 'from-gray-500/20 to-gray-600/10 border-gray-700/30 text-gray-200';
        }
      };
      
      // Use provided color, class, or generate from type
      const highlightClass = highlight.className || getTypeColor(highlight.type);
      
      result.push(
        <motion.span 
          key={highlight.id}
          initial={{ backgroundSize: "0% 100%" }}
          animate={{ backgroundSize: "100% 100%" }}
          transition={{ duration: 0.3 }}
          className={`relative group rounded px-0.5 border bg-gradient-to-r ${highlightClass}`}
          onClick={() => onHighlightClick?.(highlight.id)}
          onMouseEnter={() => {
            setIsHoveringHighlight(highlight.id);
            // Clear any existing timeout
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            if (!isPermanentHover) {
              // Set a timeout to clear the hover state
              hoverTimeoutRef.current = setTimeout(() => {
                setIsHoveringHighlight(null);
              }, 200);
            }
          }}
        >
          {highlightedText}
          
          {/* Type tooltip */}
          <span 
            className={`absolute left-0 -top-7 bg-gray-800 text-xs font-medium text-gray-200 px-2 py-1 rounded whitespace-nowrap z-30 transform -translate-x-1/4
              ${isHoveringHighlight === highlight.id ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
          >
            {highlight.type}
            {showConfidence && highlight.confidence !== undefined && (
              <span className="ml-1 text-gray-400">({Math.round(highlight.confidence * 100)}%)</span>
            )}
          </span>
          
          {/* Remove button if needed */}
          {highlight.showRemoveButton && onHighlightRemove && (
            <button
              className={`absolute -right-1 -top-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full p-0.5 z-30
                ${isHoveringHighlight === highlight.id ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}
              onClick={(e) => {
                e.stopPropagation();
                onHighlightRemove(highlight.id);
              }}
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          )}
        </motion.span>
      );
      
      lastIndex = highlight.end;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  }, [text, highlights, isHoveringHighlight, isPermanentHover, onHighlightClick, onHighlightRemove, showConfidence]);

  if (!text) {
    return (
      <div className={`bg-gray-900 rounded-lg p-6 border border-gray-800 ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No document loaded</p>
            <p className="text-sm mt-2">Upload a document to begin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Document header with status indicator */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 min-h-[52px] z-10">
        <div className="flex items-center">
          <DocumentTextIcon className="w-5 h-5 text-gray-300 mr-2" />
          <h2 className="text-base font-medium text-gray-100">
            {title}
            {subtitle && <span className="text-sm text-gray-400 ml-2">{subtitle}</span>}
          </h2>
        </div>
        
        {headerContent && (
          <div className="flex-shrink-0 h-[28px] flex items-center">
            {headerContent}
          </div>
        )}
      </div>
      
      {/* Document content area with proper scrolling */}
      <div 
        className="flex-grow overflow-y-auto p-6 bg-gray-950"
      >
        <div className="whitespace-pre-wrap font-mono text-sm text-gray-300">
          {highlightedContent}
        </div>
      </div>
    </div>
  );
} 
