"use client";

import { useState, useCallback } from "react";
import { DocumentTextIcon, CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEvaluationStore } from "@/app/store/evaluationStore";
import { loadAndParseTaggedText } from "@/app/services/evaluationService";
import Card from "../shared/Card";

export default function EvaluationFileUpload() {
  const { 
    setDocument, 
    setGroundTruth, 
    setIsLoading,
    reset
  } = useEvaluationStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      setError("Please upload a text file (.txt)");
      setSuccess(false);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    reset(); // Clear any previous results
    setSuccess(false);
    setSelectedFileName(file.name);
    
    try {
      // Process the file - must be a text file with PII tags
      const { text, groundTruth } = await loadAndParseTaggedText(file);
      
      if (groundTruth.length === 0) {
        throw new Error("No PII tags found in the document. Please ensure tags are in the format <|tag|>");
      }
      
      setDocument(text);
      setGroundTruth(groundTruth);
      setSuccess(true);
    } catch (error) {
      console.error("Error processing file:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Error processing the file. Make sure it contains properly formatted PII tags (<|tag|>)."
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [setDocument, setGroundTruth, setIsLoading, reset]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <Card title="Upload Tagged Document" icon={<DocumentTextIcon className="w-5 h-5" />}>
      <div className="p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            isDragging 
              ? "border-sky-500 bg-sky-500/10" 
              : success
                ? "border-green-500/50 bg-green-900/10"
                : error 
                  ? "border-red-500/50 bg-red-900/10" 
                  : "border-gray-600/50 hover:border-sky-500/40 hover:bg-sky-900/10"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`relative transition-all duration-300 ${isDragging ? "scale-110" : ""}`}>
              <div className={`absolute inset-0 rounded-full ${
                isDragging 
                  ? "animate-ping bg-sky-500/20" 
                  : success
                    ? "animate-pulse bg-green-500/20"
                    : "bg-transparent"
              }`}></div>
              
              {success ? (
                <CheckCircleIcon className="w-12 h-12 mb-3 text-green-400" />
              ) : (
                <CloudArrowUpIcon className={`w-12 h-12 mb-3 transition-all duration-300 ${
                  error ? "text-red-400" : isDragging ? "text-sky-400" : "text-gray-400"
                }`} />
              )}
            </div>
            
            {success ? (
              <div className="text-sm text-gray-300">
                <span className="block font-medium text-green-400">File uploaded successfully!</span>
                <span className="text-xs text-gray-400">Loaded: {selectedFileName}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                <span className="block font-medium">Drop your tagged text file here</span>
                <span className="text-xs text-gray-400">or <span className="text-sky-400 cursor-pointer hover:underline">browse files</span></span>
              </p>
            )}
            
            <input 
              type="file" 
              accept=".txt" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-3 p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 text-sm">
            <p>Document loaded with {selectedFileName && <span className="font-medium">{selectedFileName}</span>}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <div className="flex items-center mb-2">
            <DocumentTextIcon className="w-4 h-4 text-sky-400 mr-2" />
            <span className="font-medium text-gray-400">Format Requirements:</span>
          </div>
          <ul className="list-disc ml-6 space-y-1">
            <li>Text files (.txt) with PII marked using <code className="bg-gray-800 px-1 rounded">&lt;|PII content|&gt;</code> tags</li>
            <li>Each tagged item will be treated as ground truth for evaluation</li>
            <li>The system will automatically infer PII types based on content</li>
          </ul>
        </div>
      </div>
    </Card>
  );
} 
