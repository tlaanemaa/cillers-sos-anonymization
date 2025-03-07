"use client";

import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/app/store/documentStore";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { SmallText } from "../shared/Typography";
import IconWrapper from "../shared/IconWrapper";

export default function FileUpload() {
  const { setOriginalText } = useDocumentStore();
  const router = useRouter();
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setOriginalText(text);
      
      // Navigate to editor page
      router.push("/editor");
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="relative group">
      <input 
        type="file" 
        accept=".txt" 
        onChange={handleDocumentUpload}
        className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-medium
              file:bg-gradient-to-r file:from-sky-500 file:to-blue-500
              file:text-white file:shadow-sm
              hover:file:from-sky-600 hover:file:to-blue-600 transition-all duration-300 cursor-pointer"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
      
      <SmallText className="mt-3 flex items-center">
        <IconWrapper>
          <InformationCircleIcon className="w-3 h-3 text-sky-400" />
        </IconWrapper>
        Only .txt files are supported for now
      </SmallText>
    </div>
  );
} 
