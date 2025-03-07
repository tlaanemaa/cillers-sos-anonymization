"use client";

import { useDocumentStore } from "@/app/store/documentStore";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { SubsectionTitle } from "../shared/Typography";
import Card from "../shared/Card";

export default function DocumentRenderer() {
  const { originalText, anonymizedText, detections } = useDocumentStore();
  
  // Determine which text to display
  const displayText = anonymizedText || originalText;
  const isAnonymized = !!anonymizedText;

  // Create highlighted text with redactions
  const highlightedContent = useMemo(() => {
    if (!originalText || !detections.length) {
      return displayText;
    }

    // If we're showing the anonymized text, just return it
    if (isAnonymized) {
      return anonymizedText;
    }

    // Sort detections by start position
    const sortedDetections = [...detections].sort((a, b) => a.start - b.start);
    
    // Build the highlighted text
    let result = [];
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
          style={{
            backgroundImage: "linear-gradient(to right, rgba(234, 179, 8, 0.3), rgba(234, 179, 8, 0.3))",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 0",
            border: "1px solid rgba(234, 179, 8, 0.5)",
            borderRadius: "0.25rem",
            padding: "0 0.125rem",
            margin: "0 0.125rem"
          }}
          title={`${detection.type} (${Math.round(detection.confidence * 100)}% confidence)`}
        >
          {detectedText}
        </motion.span>
      );
      
      lastIndex = detection.end;
    }
    
    // Add any remaining text
    if (lastIndex < originalText.length) {
      result.push(originalText.substring(lastIndex));
    }
    
    return result;
  }, [originalText, anonymizedText, detections, isAnonymized]);

  return (
    <Card>
      <SubsectionTitle className="mb-4">
        {isAnonymized ? "Anonymized Document" : "Original Document"}
      </SubsectionTitle>
      <div className="whitespace-pre-wrap font-mono text-sm text-slate-300 p-4 bg-gray-950/50 rounded-lg border border-gray-800/30 max-h-[calc(100vh-220px)] overflow-y-auto">
        {highlightedContent}
      </div>
    </Card>
  );
} 
