"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/app/store/documentStore";
import { PageTitle } from "../shared/Typography";

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
  
  // Don't render children if no document is loaded
  if (!originalText) {
    return null;
  }
  
  return (
    <>
      <PageTitle className="mb-8">Document Editor</PageTitle>
      {children}
    </>
  );
} 
