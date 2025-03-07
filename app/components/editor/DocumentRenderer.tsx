"use client";

import { useDocumentStore } from "@/app/store/documentStore";
import { useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { DocumentTextIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function DocumentRenderer() {
  const { originalText, anonymizedText, detections, removeDetection } = useDocumentStore();
  const [isHoveringDetection, setIsHoveringDetection] = useState<string | null>(null);
  const [isPermanentHover, setIsPermanentHover] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine which text to display
  const displayText = anonymizedText || originalText;
  const isAnonymized = !!anonymizedText;

  // Create highlighted text with redactions
  const highlightedContent = useMemo(() => {
    if (!originalText || (!detections.length && !isAnonymized)) {
      return displayText;
    }

    // If we're showing the anonymized text, just return it
    if (isAnonymized) {
      return anonymizedText;
    }

    // Sort detections by start position
    const sortedDetections = [...detections].sort((a, b) => a.start - b.start);
    
    // Build the highlighted text
    const result = [];
    let lastIndex = 0;
    
    for (let i = 0; i < sortedDetections.length; i++) {
      const detection = sortedDetections[i];
      // Add text before this detection
      if (lastIndex < detection.start) {
        result.push(originalText.substring(lastIndex, detection.start));
      }
      
      // Add the highlighted detection with Framer Motion
      const detectedText = originalText.substring(detection.start, detection.end);
      
      result.push(
        <motion.span 
          key={detection.id}
          initial={{ backgroundSize: "0% 100%" }}
          animate={{ backgroundSize: "100% 100%" }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            delay: i * 0.1 % 0.5 // Staggered delay between 0 and 0.4 seconds
          }}
          className="relative"
          style={{
            backgroundImage: `
              linear-gradient(
                to bottom, 
                rgba(255, 213, 0, 0.2) calc(100% - 2px), 
                rgba(255, 176, 0, 0.7) calc(100% - 2px), 
                rgba(255, 176, 0, 0.7) 100%
              )
            `,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 0",
            position: "relative",
            boxDecorationBreak: "clone",
            paddingBottom: "1px",
            borderRadius: "3px",
            textShadow: "0 0 1px rgba(0, 0, 0, 0.1)"
          }}
          title={`${detection.type} (${Math.round(detection.confidence * 100)}% confidence)`}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setIsHoveringDetection(detection.id);
          }}
          onMouseLeave={() => {
            if (!isPermanentHover) {
              hoverTimeoutRef.current = setTimeout(() => {
                setIsHoveringDetection(null);
              }, 300);
            }
          }}
        >
          {detectedText}
          {isHoveringDetection === detection.id && (
            <div 
              className="absolute bottom-full left-0 mb-1 bg-gray-800 text-xs text-white rounded px-2 py-1 whitespace-nowrap z-50 flex items-center gap-2"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setIsPermanentHover(true);
              }}
              onMouseLeave={() => {
                setIsPermanentHover(false);
                setIsHoveringDetection(null);
              }}
            >
              <span>
                {detection.type} ({Math.round(detection.confidence * 100)}% confidence)
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeDetection(detection.id);
                }}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                title="Remove detection"
              >
                <XMarkIcon className="w-3 h-3 text-gray-400 hover:text-white" />
              </button>
            </div>
          )}
        </motion.span>
      );
      
      lastIndex = detection.end;
    }
    
    // Add any remaining text
    if (lastIndex < originalText.length) {
      result.push(originalText.substring(lastIndex));
    }
    
    return result;
  }, [originalText, anonymizedText, detections, isAnonymized, isHoveringDetection, removeDetection, isPermanentHover, displayText]);

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      {/* Document header with status indicator */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700 min-h-[52px]">
        <div className="flex items-center">
          <DocumentTextIcon className="w-5 h-5 text-gray-300 mr-2" />
          <h2 className="text-base font-medium text-gray-100">
            {isAnonymized ? "Anonymized Document" : "Original Document with PII Detection"}
          </h2>
        </div>
        
        <div className="flex-shrink-0 h-[28px] flex items-center">
          {isAnonymized ? (
            <div className="flex items-center text-xs text-green-400 font-medium bg-green-900/40 border border-green-800/40 px-2 py-1 rounded-full">
              <EyeSlashIcon className="w-4 h-4 mr-1" />
              Anonymized
            </div>
          ) : detections.length > 0 ? (
            <div className="flex items-center text-xs text-yellow-400 font-medium bg-yellow-900/40 border border-yellow-800/40 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></span>
              {detections.length} PII Detected
            </div>
          ) : (
            <div className="invisible">
              <span className="w-2 h-2 rounded-full mr-1"></span>
              &nbsp;
            </div>
          )}
        </div>
      </div>
      
      {/* Document content area with helpful placeholder */}
      <div 
        className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-850"
        style={{ backgroundColor: "#121621" }}
      >
        {originalText ? (
          <div className="whitespace-pre-wrap font-serif text-base text-gray-200 leading-relaxed">
            {highlightedContent}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <DocumentTextIcon className="w-16 h-16 mb-4 text-gray-600" />
            <p className="text-center mb-2">No document loaded</p>
            <p className="text-center text-sm text-gray-500">Return to the home page to upload or select a document</p>
          </div>
        )}
      </div>
      
      {/* Selection instructions */}
      {!isAnonymized && originalText && (
        <div className="text-xs text-gray-400 px-6 py-2 border-t border-gray-700 bg-gray-800">
          Select text to manually mark as PII information
        </div>
      )}
    </div>
  );
} 
