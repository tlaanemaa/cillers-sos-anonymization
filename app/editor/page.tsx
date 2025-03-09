"use client";

import EditorLayout from "../components/editor/EditorLayout";
import DocumentRenderer from "../components/editor/DocumentRenderer";
import ControlPanel from "../components/editor/ControlPanel";
import Container from "../components/shared/Container";
import ResponsiveLayout from "../components/shared/ResponsiveLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function EditorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-gray-900 to-slate-950">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-pink-500/5 rounded-full filter blur-[120px]"></div>
      </div>
      
      {/* Header with navigation */}
      <header className="relative z-10 w-full border-b border-slate-800/40 backdrop-blur-sm bg-slate-900/30">
        <Container maxWidth="full">
          <div className="flex items-center py-3 px-2 md:px-4">
            <Link href="/" className="flex items-center text-slate-300 hover:text-white transition-colors text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            {/* We can leave the right side empty for a cleaner look */}
          </div>
        </Container>
      </header>
      
      <Container maxWidth="full" className="w-full relative z-10 px-2 py-4 flex-1 flex flex-col">
        <EditorLayout>
          <ResponsiveLayout
            leftContent={<DocumentRenderer />}
            rightContent={<ControlPanel />}
          />
        </EditorLayout>
      </Container>
      
      {/* Footer with keyboard shortcuts */}
      <footer className="relative z-10 border-t border-slate-800/30 py-3 backdrop-blur-sm bg-slate-900/30">
        <Container maxWidth="full">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs">
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 mx-1 shadow-sm">Tab</kbd>
              <span className="text-slate-400">Navigate controls</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 mx-1 shadow-sm">Ctrl</kbd>
              <span className="text-slate-400">+</span>
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 mx-1 shadow-sm">S</kbd>
              <span className="text-slate-400">Save document</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 mx-1 shadow-sm">Esc</kbd>
              <span className="text-slate-400">Cancel selection</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-800/30 flex justify-center">
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Redact AI</span>
              {" "}· Secure document processing
            </span>
          </div>
        </Container>
      </footer>
    </main>
  );
} 
