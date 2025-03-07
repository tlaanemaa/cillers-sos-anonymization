"use client";

import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/app/store/documentStore";
import { SAMPLE_TEXT } from "@/ai/mock";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Button from "../shared/Button";

interface SampleFileProps {
  showAsButton?: boolean;
  className?: string;
}

export default function SampleFile({ showAsButton = false, className = '' }: SampleFileProps) {
  const { setOriginalText } = useDocumentStore();
  const router = useRouter();
  
  const loadDemoText = () => {
    setOriginalText(SAMPLE_TEXT);
    
    // Navigate to editor page
    router.push("/editor");
  };

  if (showAsButton) {
    return (
      <Button 
        onClick={loadDemoText}
        variant="secondary"
        className={`group relative overflow-hidden transition-all duration-300 ${className}`}
      >
        Try Demo Document
      </Button>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <Button 
        onClick={loadDemoText}
        variant="secondary"
        fullWidth
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-md py-3 bg-gradient-to-r from-pink-600/90 to-indigo-600/90 hover:from-pink-600 hover:to-indigo-600 border-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0 transition-all duration-1000"></div>
        <div className="flex items-center justify-center gap-3 text-white">
          <DocumentTextIcon className="w-5 h-5 text-pink-200 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Try Demo Document</span>
        </div>
      </Button>
      <p className="text-xs text-gray-400 mt-2">See how it works with our pre-populated example</p>
    </div>
  );
} 
