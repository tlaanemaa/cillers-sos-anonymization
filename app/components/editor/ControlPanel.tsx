"use client";

import { useState } from "react";
import { useDocumentStore } from "@/app/store/documentStore";
import { detectPII, applyRedactions } from "@/ai";
import { MagnifyingGlassIcon, ArchiveBoxIcon, ArrowDownTrayIcon, PlusCircleIcon, QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const [showTips, setShowTips] = useState(false);
  
  const handleDetectPII = async () => {
    // Check if there are any manual detections and confirm if needed
    const hasManualDetections = detections.some(d => d.type === "MANUAL_PII");
    
    if (hasManualDetections) {
      const confirmed = window.confirm(
        "This will overwrite any manually added PII sections. Continue?"
      );
      if (!confirmed) return;
    }
    
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

  // Add a manual PII section
  const handleAddPIISection = () => {
    // Get the current selection from the document
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !originalText) {
      alert("Please select text in the document to mark as PII");
      return;
    }
    
    const range = selection.getRangeAt(0);
    const selectionContainer = range.commonAncestorContainer;
    
    // Find the document container element
    const documentContainer = document.querySelector(".whitespace-pre-wrap");
    if (!documentContainer || !documentContainer.contains(selectionContainer)) {
      alert("Please select text within the document");
      return;
    }
    
    // Get the text content
    const selectedText = selection.toString();
    if (!selectedText || selectedText.length === 0) {
      alert("Please select text to mark as PII");
      return;
    }

    // Find the absolute position in the original text
    // This is a simplified approach, might need adjustments based on your exact setup
    const textBeforeSelection = document.createRange();
    textBeforeSelection.setStart(documentContainer.firstChild, 0);
    textBeforeSelection.setEnd(range.startContainer, range.startOffset);
    const startPos = textBeforeSelection.toString().length;
    
    // Add this as a new detection
    const newDetection = {
      id: `manual-${Date.now()}`,
      type: "MANUAL_PII",
      start: startPos,
      end: startPos + selectedText.length,
      confidence: 1.0,
      text: selectedText
    };
    
    setDetections([...detections, newDetection]);
  };

  // If no document is loaded, show a message
  if (!originalText) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400 py-8">
          <p className="mb-2">No document loaded</p>
          <p className="text-sm">Return to home to upload a document</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with workflow stage indication */}
      <div className="p-4 border-b border-gray-700/40 flex items-center justify-between">
        <h2 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
          Document Controls
        </h2>
        
        <button 
          onClick={() => setShowTips(!showTips)}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showTips ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <QuestionMarkCircleIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Tips panel */}
      {showTips && (
        <div className="p-4 bg-gray-800/40 border-b border-gray-700/40 text-xs text-gray-300">
          <h3 className="font-medium mb-2">Quick Tips:</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Adjust the risk slider to control detection sensitivity</li>
            <li>Select text directly in the document to mark as PII</li>
            <li>Click detected PII items to see details</li>
            <li>Press Esc to cancel a selection</li>
          </ul>
        </div>
      )}
      
      <div className="p-4 space-y-4">
        {anonymizedText ? (
          // Stage 3: Document anonymized - show download options
          <>
            <div className="flex items-center justify-center px-3 py-2 bg-green-900/20 border border-green-800/30 rounded-lg mb-4">
              <span className="text-sm text-green-400">Document anonymized successfully</span>
            </div>
            
            <Button 
              onClick={handleDownload}
              variant="primary"
              fullWidth
              className="hover:shadow-md hover:shadow-sky-900/30 transition-all"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Download Anonymized Document
            </Button>
          </>
        ) : (
          <>
            {/* Always show detection controls */}
            <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40 mb-4">
              <div className="mb-2 flex justify-between">
                <label className="text-sm text-gray-300">Risk Tolerance</label>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{Math.round(riskTolerance * 100)}%</span>
              </div>
              <RiskSlider 
                value={riskTolerance} 
                onChange={setRiskTolerance} 
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleDetectPII}
                variant="primary"
                fullWidth
                disabled={isProcessing}
                className="hover:shadow-md hover:shadow-sky-900/30 transition-all"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner />
                    Processing...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    {detections.length > 0 ? "Re-detect PII" : "Detect PII"}
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleAddPIISection}
                variant="secondary"
                fullWidth
                className="hover:shadow-md hover:shadow-pink-900/30 transition-all"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Add Selected PII
              </Button>
              
              {detections.length > 0 && (
                <Button 
                  onClick={handleAnonymize}
                  variant="secondary"
                  fullWidth
                  disabled={isProcessing}
                  className="hover:shadow-md hover:shadow-indigo-900/30 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner />
                      Anonymizing...
                    </>
                  ) : (
                    <>
                      <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                      Anonymize Document
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
        
        <div className="text-gray-400 text-xs text-center pt-4 border-t border-gray-700/30 mt-2">
          <div className="mb-1 text-gray-500">
            Document Editor v1.0
          </div>
        </div>
      </div>
    </div>
  );
} 
