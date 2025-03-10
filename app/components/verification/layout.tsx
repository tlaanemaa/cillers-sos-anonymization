"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface VerifyLayoutProps {
  children: ReactNode;
}

export default function VerifyLayout({ children }: VerifyLayoutProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we have the anonymized text in sessionStorage
    const storedText = sessionStorage.getItem("anonymizedText");
    if (!storedText) {
      // Redirect to editor if no anonymized text is available
      router.push("/editor");
    }
  }, [router]);

  return (
    <div className="w-full flex-1 flex flex-col">
      {children}
    </div>
  );
}