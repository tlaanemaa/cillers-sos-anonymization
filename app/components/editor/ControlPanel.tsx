"use client";

import { useState } from "react";
import { useDocumentStore } from "@/app/store/documentStore";
import { detectPII, applyRedactions } from "@/ai";
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Card from "../shared/Card";
import Button from "../shared/Button";
import { SectionTitle } from "../shared/Typography";
import IconWrapper from "../shared/IconWrapper";
import RiskSlider from "./RiskSlider";

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function ControlPanel() {
  const { 
    originalText, 
    detections, 
    anonymizedText,
    riskTolerance,
    setDetections, 
    setAnonymizedText,
    setRiskTolerance
  } = useDocumentStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDetectPII = async () => {
    setIsProcessing(true);
    
    const foundDetections = await detectPII(originalText, riskTolerance);
    setDetections(foundDetections);
    setIsProcessing(false);
  };
  
  const handleAnonymize = async () => {
    setIsProcessing(true);
    
    try {
      // Apply redactions - await the result since it's async
      const result = await applyRedactions(originalText, detections);
      setAnonymizedText(result);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error applying redactions:", error);
      setIsProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!anonymizedText) return;
    
    const blob = new Blob([anonymizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anonymized_document.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <SectionTitle className="mb-6 flex items-center">
        <IconWrapper className="text-sky-400">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </IconWrapper>
        Controls
      </SectionTitle>
      
      <div className="flex flex-col gap-4">
        {anonymizedText ? (
          // If we have anonymized text, show download button
          <Button 
            onClick={handleDownload}
            variant="primary"
            fullWidth
          >
            <IconWrapper>
              <ArrowDownTrayIcon className="w-5 h-5 hover:scale-110 transition-transform" />
            </IconWrapper>
            <span>Download Anonymized Document</span>
          </Button>
        ) : (
          // Otherwise show detection and anonymization controls
          <>
            <RiskSlider 
              value={riskTolerance} 
              onChange={setRiskTolerance} 
            />
            
            <Button 
              onClick={handleDetectPII}
              variant="primary"
              fullWidth
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <IconWrapper>
                    <LoadingSpinner />
                  </IconWrapper>
                  Processing...
                </>
              ) : (
                <>
                  <IconWrapper>
                    <MagnifyingGlassIcon className="w-5 h-5 hover:scale-110 transition-transform" />
                  </IconWrapper>
                  <span>Detect PII</span>
                </>
              )}
            </Button>
            
            {detections.length > 0 && (
              <Button 
                onClick={handleAnonymize}
                variant="secondary"
                fullWidth
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <IconWrapper>
                      <LoadingSpinner />
                    </IconWrapper>
                    Anonymizing...
                  </>
                ) : (
                  <>
                    <IconWrapper>
                      <ArchiveBoxIcon className="w-5 h-5 hover:scale-110 transition-transform" />
                    </IconWrapper>
                    <span>Anonymize Document</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
} 
