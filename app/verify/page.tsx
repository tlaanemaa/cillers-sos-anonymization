"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/shared/Button";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const [anonymizedText, setAnonymizedText] = useState<string>("");
  const [verification, setVerification] = useState<{ complete: boolean; issues: string[] }>({
    complete: false,
    issues: [],
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the anonymized text from sessionStorage
    const storedText = sessionStorage.getItem("anonymizedText");
    
    if (!storedText) {
      // If no text found, show an error message briefly and redirect back
      setTimeout(() => {
        router.push("/editor");
      }, 2000);
      return;
    }
    
    setAnonymizedText(storedText);
    setLoading(false);
    
    // Optional: Perform automatic verification checks
    const issues = performVerificationChecks(storedText);
    setVerification({
      complete: issues.length === 0,
      issues: issues,
    });
  }, [router]);

  // This function would contain your verification logic
  const performVerificationChecks = (text: string): string[] => {
    const issues: string[] = [];
    
    // Example checks - replace with your actual verification logic
    
    // Check for common PII patterns that might have been missed
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
      issues.push("Possible email address detected");
    }
    
    if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) {
      issues.push("Possible phone number detected");
    }
    
    if (/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/.test(text)) {
      issues.push("Possible SSN detected");
    }
    
    // Check for redaction marks that might indicate incomplete anonymization
    if (/\[REDACTED\]/.test(text)) {
      issues.push("Redaction placeholders found - may need review");
    }
    
    return issues;
  };

  const handleBackToEditor = () => {
    router.push("/editor");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="p-8 rounded-lg bg-gray-800 max-w-2xl w-full text-center">
          <div className="animate-pulse">Loading document for verification...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Document Verification
          </h1>
          <Button onClick={handleBackToEditor} variant="secondary">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
        </div>

        {/* Verification status */}
        <div className={`p-4 mb-6 rounded-lg ${verification.complete ? 'bg-green-900/20 border border-green-700' : 'bg-yellow-900/20 border border-yellow-700'}`}>
          <div className="flex items-center">
            {verification.complete ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400 mr-2" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-yellow-400 mr-2" />
            )}
            <span className={verification.complete ? 'text-green-400' : 'text-yellow-400'}>
              {verification.complete ? 'Document successfully anonymized' : 'Potential issues detected'}
            </span>
          </div>
          
          {verification.issues.length > 0 && (
            <div className="mt-3 pl-8">
              <p className="text-sm text-gray-300 mb-2">Found {verification.issues.length} potential issues:</p>
              <ul className="list-disc pl-5 text-sm text-yellow-300">
                {verification.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Document preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-medium mb-3 text-gray-300">Anonymized Document Preview</h2>
          <div className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-mono text-sm text-gray-300 max-h-96 overflow-y-auto">
            {anonymizedText}
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to perform additional verification checks if needed
const performVerificationChecks = (text: string): string[] => {
  // Implement verification logic here
  const issues: string[] = [];
  
  // Example checks
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
    issues.push("Possible email address detected");
  }
  
  return issues;
};