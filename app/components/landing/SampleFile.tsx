"use client";

import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/app/store/documentStore";
import { SAMPLE_TEXT } from "@/ai/mock";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import Button from "../shared/Button";
import IconWrapper from "../shared/IconWrapper";

export default function SampleFile() {
  const { setOriginalText } = useDocumentStore();
  const router = useRouter();
  
  const loadDemoText = () => {
    setOriginalText(SAMPLE_TEXT);
    
    // Navigate to editor page
    router.push("/editor");
  };

  return (
    <Button 
      onClick={loadDemoText}
      variant="secondary"
      fullWidth
    >
      <IconWrapper>
        <DocumentTextIcon className="w-5 h-5 hover:scale-110 transition-transform" />
      </IconWrapper>
      <span>Load Demo Text</span>
    </Button>
  );
} 
