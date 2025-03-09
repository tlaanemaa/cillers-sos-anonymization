"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/shared/Button";
import { useDocumentStore } from "@/app/store/documentStore";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const { originalText } = useDocumentStore();
  const [anonymizedText, setAnonymizedText] = useState<string>("");
  const [verification, setVerification] = useState<{ complete: boolean; issues: string[] }>({
    complete: false,
    issues: [],
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"side-by-side" | "differences">("side-by-side");
  const router = useRouter();

  useEffect(() => {
    const checkDocuments = async () => {
      const storedAnonymizedText = sessionStorage.getItem("anonymizedText");
      const storedOriginalText = sessionStorage.getItem("originalText");
      
      if (!storedAnonymizedText) {
        alert("No anonymized document found to verify. Redirecting to editor...");
        setTimeout(() => {
          router.push("/editor");
        }, 1000);
        return;
      }
      
      setAnonymizedText(storedAnonymizedText);
      
      // Use stored original text if available
      const textToUse = storedOriginalText || originalText;
      
      // Await the async verification
      const issues = await performVerificationChecks(storedAnonymizedText, textToUse);
      setVerification({
        complete: issues.length === 0,
        issues: issues,
      });
      
      setLoading(false);
    };
    
    checkDocuments();
  }, [router, originalText]);

  // Add this function to your component
  const checkForBirthdayWithAI = async (text: string, prompt?: string): Promise<boolean> => {
    const defaultPrompt = `Analyze the following text and determine if it contains any birth dates or age information. Only respond with "true" if you detect birth dates or age information, otherwise respond with "false".`;
    
    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, prompt: prompt || defaultPrompt }),
      });
      
      const data = await response.json();
      return data.containsBirthday;
    } catch (error) {
      console.error('Error checking with Gemini:', error);
      return false;
    }
  };


  // Verification logic
  const performVerificationChecks = async (anonymizedText: string, originalText: string): Promise<string[]> => {
    const issues: string[] = [];
    
    // Check for common PII patterns that might have been missed
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(anonymizedText)) {
      issues.push("Possible email address detected in anonymized text");
    }
    
    if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(anonymizedText)) {
      issues.push("Possible phone number detected in anonymized text");
    }
    
    if (/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/.test(anonymizedText)) {
      issues.push("Possible SSN detected in anonymized text");
    }
    // AI-powered birthday check
  const containsBirthday = await checkForBirthdayWithAI(anonymizedText);
  if (containsBirthday) {
    issues.push("Gemini detected a possible birth date in anonymized text");
  }
    
    // Add more checks as needed
    
    return issues;
  };

  const handleBackToEditor = () => {
    router.push("/editor");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "side-by-side" ? "differences" : "side-by-side");
  };

  // Highlight differences between original and anonymized text
  const highlightDifferences = () => {
    if (!originalText || !anonymizedText) return anonymizedText;
    
    // This is a simple difference highlighter
    // For a more sophisticated approach, you might want to use a diff library
    const words1 = originalText.split(/\s+/);
    const words2 = anonymizedText.split(/\s+/);
    
    const result = words2.map((word, index) => {
      if (index >= words1.length) return `<span class="text-blue-400">${word}</span>`;
      if (word !== words1[index]) return `<span class="text-blue-400">${word}</span>`;
      return word;
    }).join(' ');
    
    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="p-8 rounded-lg bg-gray-800 max-w-2xl w-full text-center">
          <div className="animate-pulse">Loading documents for verification...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Document Verification
          </h1>
          <div className="flex space-x-3">
            <Button 
              onClick={toggleViewMode} 
              variant="secondary"
              className="hover:shadow-md hover:shadow-indigo-900/30 transition-all"
            >
              <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
              {viewMode === "side-by-side" ? "Show Differences" : "Side by Side"}
            </Button>
            <Button onClick={handleBackToEditor} variant="secondary">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
          </div>
        </div>

        {/* Verification status */}


        <div className={`p-4 mb-6 rounded-lg ${verification.complete ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-red-900/20 border border-red-700'}`}>
          <div className="flex items-center">
            {verification.complete ? (
              <CheckCircleIcon className="w-6 h-6 text-yellow-400 mr-2" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-400 mr-2" />
            )}
            <span className={verification.complete ? 'text-yellow-400' : 'text-red-400'}>
              {verification.complete ? 'No issues detected. Still review carefully before usage' : 'Potential issues detected'}
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

        {/* Document comparison */}
        {viewMode === "side-by-side" ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Original document */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3 text-gray-300">Original Document</h2>
              <div className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-mono text-sm text-gray-300 max-h-96 overflow-y-auto">
              {sessionStorage.getItem("originalText") || originalText}
            </div>
            </div>
            
            {/* Anonymized document */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-medium mb-3 text-gray-300">Anonymized Document</h2>
              <div className="bg-gray-900 p-4 rounded whitespace-pre-wrap font-mono text-sm text-gray-300 max-h-96 overflow-y-auto">
                {anonymizedText}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3 text-gray-300">Document with Highlighted Changes</h2>
            <div className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-300 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: highlightDifferences() }} className="whitespace-pre-wrap" />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              <span className="inline-block px-2 py-0.5 mr-2 bg-blue-400 text-blue-900 rounded">Blue text</span> 
              indicates text that has been modified or anonymized
            </div>
          </div>
        )}
      </div>
    </div>
  );
}