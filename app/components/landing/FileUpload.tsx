"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDocumentStore } from "@/app/store/documentStore";
import {
  InformationCircleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import IconWrapper from "../shared/IconWrapper";
import LoadingSpinner from "../shared/LoadingSpinner";
import { processPDF } from "@/app/actions/load_and_redact";

export default function FileUpload() {
  const { setOriginalText } = useDocumentStore();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = useCallback(
    async (file: File) => {
      try {
        setIsProcessing(true);

        if (file.type === "application/pdf") {
          setProcessingMessage(`Converting ${file.name}`);
          const text = await processPDF(file);
          setProcessingMessage("Opening editor...");
          setOriginalText(text);
        } else {
          setProcessingMessage(`Reading ${file.name}`);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const text = e.target.result.toString();
              setProcessingMessage("Opening editor...");
              setOriginalText(text);
              router.push("/editor");
            }
          };
          reader.readAsText(file);
        }

        router.push("/editor");
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file. Please try again.");
      } finally {
        setIsProcessing(false);
        setProcessingMessage("");
      }
    },
    [router, setOriginalText]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
          isDragging
            ? "border-sky-400 bg-sky-400/10"
            : "border-slate-700/50 hover:border-sky-400/50 hover:bg-slate-800/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`transition-transform duration-300 ${
              isDragging ? "scale-110" : ""
            }`}
          >
            <CloudArrowUpIcon
              className={`w-10 h-10 transition-colors duration-300 ${
                isDragging ? "text-sky-400" : "text-slate-400"
              }`}
            />
          </div>

          <div>
            <p
              className={`text-sm font-medium transition-colors duration-300 ${
                isDragging ? "text-sky-400" : "text-slate-300"
              }`}
            >
              {isDragging ? "Drop to upload" : "Drop your file here"}
            </p>
            {!isProcessing ? (
              <p className="text-xs text-slate-400 mt-1">
                or{" "}
                <span className="text-sky-400 cursor-pointer hover:underline">
                  browse files
                </span>
              </p>
            ) : (
              <div className="flex items-center justify-center gap-2 mt-2">
                <LoadingSpinner className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-sky-400">
                  {processingMessage}
                </span>
              </div>
            )}
          </div>

          <input
            type="file"
            accept=".txt,.pdf"
            onChange={handleDocumentUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center text-xs text-slate-400">
        <IconWrapper>
          <InformationCircleIcon className="w-3 h-3 text-sky-400" />
        </IconWrapper>
        Supported formats: .txt, .pdf
      </div>
    </div>
  );
}
