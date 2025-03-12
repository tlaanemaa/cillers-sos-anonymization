"use client";

import { useState } from "react";
import { useDocumentStore } from "@/app/store/documentStore";
import { detect, redact } from "@/ai";
import { Redaction, PiiType } from "@/ai/schemas";
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Button from "../shared/Button";
import LoadingSpinner from "../shared/LoadingSpinner";
import PiiTypeSelector from "./PiiTypeSelector";
import FreeTextInput from "./FreeTextInput";
import RiskTolerancePanel from "./RiskTolerancePanel";

export default function ControlPanel() {
  const {
    originalText,
    detections,
    anonymizedText,
    riskTolerance,
    setDetections,
    setAnonymizedText,
    setRiskTolerance,
  } = useDocumentStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedPiiTypes, setSelectedPiiTypes] = useState<PiiType[]>([]);
  const [freeTextInput, setFreeTextInput] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleDetectPII = async () => {
    // Check if there are any manual detections and confirm if needed
    const hasManualDetections = detections.some((d) => d.type === "MANUAL_PII");

    if (hasManualDetections) {
      const confirmed = window.confirm(
        "This will overwrite any manually added PII sections. Continue?"
      );
      if (!confirmed) return;
    }

    setIsProcessing(true);

    const foundDetections = await detect(
      originalText,
      riskTolerance,
      selectedPiiTypes,
      freeTextInput
    );
    setDetections(foundDetections);
    setIsProcessing(false);
  };

  const handleAnonymize = async () => {
    setIsProcessing(true);

    try {
      // Apply redactions - await the result since it's async
      const result = await redact(originalText, detections);
      setAnonymizedText(result);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error applying redactions:", error);
      setIsProcessing(false);
    }
  };

  const handleVerifyClick = () => {
    if (!anonymizedText) {
      alert('Please anonymize the document first before verifying');
      return;
    }
    
    // Create a base URL that works in different environments
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const modifiedContentUrl = `${baseUrl}/verification`;
    
    // Store the anonymized text in sessionStorage so the verification page can access it
    sessionStorage.setItem('anonymizedText', anonymizedText);
    sessionStorage.setItem('originalText', originalText); 
    
    // Open the new tab
    const newTab = window.open(modifiedContentUrl, '_blank');
  
    // Check if the new tab was successfully opened
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      alert('Failed to open the verification page. Please check your popup blocker settings.');
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
    const firstChild = documentContainer.firstChild;
    if (!firstChild) {
      alert("Cannot determine text position");
      return;
    }

    // This is a simplified approach, might need adjustments based on your exact setup
    const textBeforeSelection = document.createRange();
    textBeforeSelection.setStart(firstChild, 0);
    textBeforeSelection.setEnd(range.startContainer, range.startOffset);
    const startPos = textBeforeSelection.toString().length;

    // Add this as a new detection
    const newDetection: Redaction = {
      id: `manual-${Date.now()}`,
      type: "MANUAL_PII",
      start: startPos,
      end: startPos + selectedText.length,
      confidence: 1.0,
      text: selectedText,
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
            <li>Use Advanced Options to customize PII types and add context</li>
          </ul>
        </div>
      )}

      <div className="p-4 space-y-4">
        {anonymizedText ? (
          // Stage 3: Document anonymized - show download options
          <>
            <div className="flex items-center justify-center px-3 py-2 bg-green-900/20 border border-green-800/30 rounded-lg mb-4">
              <span className="text-sm text-green-400">
                Document anonymized successfully
              </span>
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
            {/* Risk Tolerance Panel - Always visible */}
            <RiskTolerancePanel
              riskTolerance={riskTolerance}
              onChange={setRiskTolerance}
            />

            {/* Advanced Options Toggle - now more compact */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Advanced options</span>
                {showAdvancedOptions ? (
                  <ChevronDownIcon className="w-3 h-3" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Advanced Options Panel */}
            <div 
              className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                showAdvancedOptions 
                  ? "max-h-[1000px] opacity-100 mb-4" 
                  : "max-h-0 opacity-0"
              }`}
            >
              {/* PII Types Selection */}
              <PiiTypeSelector
                selectedTypes={selectedPiiTypes}
                onChange={setSelectedPiiTypes}
              />

              {/* Free Text Input */}
              <FreeTextInput value={freeTextInput} onChange={setFreeTextInput} />
            </div>

            {/* Action Buttons - Always visible */}
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
                    Detect PII
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

        {/* Verification button */}
        {anonymizedText && (
          <Button
            onClick={handleVerifyClick}
            variant="primary"
            fullWidth
            className="hover:shadow-md hover:shadow-sky-900/30 transition-all"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Verify Anonymized Document
          </Button>
        )}


        <div className="text-gray-400 text-xs text-center pt-4 border-t border-gray-700/30 mt-2">
          <div className="mb-1 text-gray-500">Document Editor v1.0</div>
        </div>
      </div>
    </div>
  );
}
