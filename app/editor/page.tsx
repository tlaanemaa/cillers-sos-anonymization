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
      <header className="relative z-10 w-full border-b border-gray-800/40 backdrop-blur-sm bg-gray-900/20">
        <Container maxWidth="full">
          <div className="flex items-center py-3 px-2 md:px-4">
            <Link href="/" className="flex items-center text-gray-400 hover:text-gray-200 transition-colors text-sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="ml-auto text-sm text-gray-400">Document Anonymizer</div>
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
      <footer className="relative z-10 border-t border-gray-800/30 py-2 backdrop-blur-sm bg-gray-900/20">
        <Container maxWidth="full">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
            <div className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 mx-1">Tab</kbd>
              <span>Navigate controls</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 mx-1">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 mx-1">S</kbd>
              <span>Save document</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 mx-1">Esc</kbd>
              <span>Cancel selection</span>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
} 
