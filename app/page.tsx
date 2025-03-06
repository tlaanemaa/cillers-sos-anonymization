"use client";

import DocumentAnonymizer from './components/DocumentAnonymizer';

export default function Home() {
  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto relative px-4 py-6">
      {/* Background gradient effects */}
      <div className="absolute top-20 -left-4 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 -right-4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        <DocumentAnonymizer />
      </div>
    </div>
  );
}
