"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDocumentStore } from "@/app/store/documentStore";
import { InformationCircleIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import IconWrapper from "../shared/IconWrapper";
import { processPDF } from "@/app/actions/pdf";

export default function FileUpload() {
  const { setOriginalText } = useDocumentStore();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };
  
  const processFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      
      if (file.type === 'application/pdf') {
        // Handle PDF file using server action
        const text = await processPDF(file);
        setOriginalText(text);
      } else {
        // Handle text file as before
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const text = e.target.result.toString();
            setOriginalText(text);
          }
        };
        reader.readAsText(file);
      }
      
      router.push("/editor");
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [router, setOriginalText]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className="relative">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          isDragging 
            ? "border-sky-500 bg-sky-500/10" 
            : "border-gray-600/50 hover:border-sky-500/40 hover:bg-sky-900/10"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className={`relative transition-all duration-300 ${isDragging ? "scale-110" : ""}`}>
            <div className={`absolute inset-0 rounded-full ${isDragging ? "animate-ping bg-sky-500/20" : "bg-transparent"}`}></div>
            <CloudArrowUpIcon className={`w-10 h-10 mb-2 transition-all duration-300 ${
              isDragging ? "text-sky-400" : "text-gray-400"
            }`} />
          </div>
          
          <p className="text-sm text-gray-300">
            <span className="block font-medium">
              {isProcessing ? "Processing..." : "Drop your file here"}
            </span>
            <span className="text-xs text-gray-400">or <span className="text-sky-400 cursor-pointer hover:underline">browse files</span></span>
          </p>
          
          <input 
            type="file" 
            accept=".txt,.pdf" 
            onChange={handleDocumentUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
        <IconWrapper>
          <InformationCircleIcon className="w-3 h-3 text-sky-400" />
        </IconWrapper>
        Supported formats: .txt, .pdf
      </div>
    </div>
  );
} 
