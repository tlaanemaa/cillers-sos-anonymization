"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/app/store/documentStore";

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  const { originalText } = useDocumentStore();
  const router = useRouter();
  
  // Redirect to home if no document is loaded
  useEffect(() => {
    if (!originalText) {
      router.push("/");
    }
  }, [originalText, router]);
  
  // Don't render null if no document, now we handle empty state in the document renderer
  
  return (
    <div className="w-full flex-1 flex flex-col">
      {children}
    </div>
  );
} 
