"use client";

import { ShieldCheckIcon, EyeSlashIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import FileUpload from "./components/landing/FileUpload";
import SampleFile from "./components/landing/SampleFile";
import Container from "./components/shared/Container";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-gray-900 to-slate-950">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-pink-500/5 rounded-full filter blur-[120px]"></div>
      </div>
      
      {/* Hero Section - All Above the Fold */}
      <section className="relative w-full overflow-hidden flex-1 flex items-center py-8 md:py-12">
        {/* Animated particles background */}
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            {Array.from({ length: 35 }).map((_, index) => (
              <div 
                key={index}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 5 + 2}px`,
                  height: `${Math.random() * 5 + 2}px`,
                  background: index % 4 === 0 
                    ? 'rgba(56, 189, 248, 0.35)' 
                    : index % 4 === 1 
                    ? 'rgba(244, 114, 182, 0.35)' 
                    : index % 4 === 2
                    ? 'rgba(99, 102, 241, 0.35)'
                    : 'rgba(234, 179, 8, 0.35)',
                  filter: 'blur(1px)',
                  animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <Container maxWidth="full" className="relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 px-4 md:px-8 items-center max-w-7xl mx-auto">
            {/* Left Side - Value Proposition & Features */}
            <div className="order-1 md:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="text-white">Stop Leaking </span>
                <span className="super-gradient animate-gradient font-extrabold">Sensitive Data</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-lg">
                Our AI anonymizer <span className="font-semibold text-sky-300">instantly removes personal information</span> from your documents with just one click.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-start gap-3 mb-8">
                <div className="bg-gradient-to-r from-green-950/40 to-emerald-900/30 rounded-full px-4 py-1.5 border border-green-800/30 shadow-sm flex items-center group transition-all duration-300 hover:border-green-600/50 hover:from-green-900/50 hover:to-emerald-800/40">
                  <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 group-hover:text-green-300 transition-all" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-xs font-medium text-green-300 group-hover:text-green-200 transition-all">GDPR Compliant</span>
                </div>
                
                <div className="bg-gradient-to-r from-blue-950/40 to-sky-900/30 rounded-full px-4 py-1.5 border border-blue-800/30 shadow-sm flex items-center group transition-all duration-300 hover:border-blue-600/50 hover:from-blue-900/50 hover:to-sky-800/40">
                  <svg className="w-4 h-4 text-sky-400 mr-2 flex-shrink-0 group-hover:text-sky-300 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-medium text-sky-300 group-hover:text-sky-200 transition-all">100% Secure</span>
                </div>
                
                <div className="bg-gradient-to-r from-purple-950/40 to-indigo-900/30 rounded-full px-4 py-1.5 border border-purple-800/30 shadow-sm flex items-center group transition-all duration-300 hover:border-purple-600/50 hover:from-purple-900/50 hover:to-indigo-800/40">
                  <svg className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0 group-hover:text-indigo-300 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs font-medium text-indigo-300 group-hover:text-indigo-200 transition-all">Privacy-first</span>
                </div>
              </div>
              
              {/* Feature Mini Cards with hover interaction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-sky-950/80 to-sky-900/40 backdrop-blur-sm rounded-xl p-5 border border-sky-800/30 shadow-sm shadow-sky-900/20 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:shadow-sky-900/30 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-sky-500/20 rounded-lg p-3 mb-3 group-hover:bg-sky-500/30 transition-all">
                        <ShieldCheckIcon className="h-6 w-6 text-sky-400 group-hover:text-sky-300 transition-colors" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-sky-200 transition-colors">Smart Detection</h3>
                      <p className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">Finds names, addresses, IDs & more automatically</p>
                    </div>
                  </div>
                </div>
                
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-pink-950/80 to-pink-900/40 backdrop-blur-sm rounded-xl p-5 border border-pink-800/30 shadow-sm shadow-pink-900/20 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:shadow-pink-900/30 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-pink-500/20 rounded-lg p-3 mb-3 group-hover:bg-pink-500/30 transition-all">
                        <EyeSlashIcon className="h-6 w-6 text-pink-400 group-hover:text-pink-300 transition-colors" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-pink-200 transition-colors">Perfect Redaction</h3>
                      <p className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">Keeps context intact while hiding sensitive data</p>
                    </div>
                  </div>
                </div>
                
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-indigo-950/80 to-indigo-900/40 backdrop-blur-sm rounded-xl p-5 border border-indigo-800/30 shadow-sm shadow-indigo-900/20 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:shadow-indigo-900/30 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-indigo-500/20 rounded-lg p-3 mb-3 group-hover:bg-indigo-500/30 transition-all">
                        <DocumentCheckIcon className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-200 transition-colors">Ready in Seconds</h3>
                      <p className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">Download anonymized documents immediately</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Action Area */}
            <div id="try-it-section" className="order-2 md:order-2">
              <div className="backdrop-blur-md p-6 rounded-xl">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-6">
                  Try It Now
                </h2>
                
                <div className="bg-gray-800/40 rounded-lg p-5 border border-gray-700/50 hover:border-sky-500/30 transition-colors backdrop-blur-sm shadow-md mb-6">
                  <FileUpload />
                </div>
                
                <div className="flex items-center justify-center my-4">
                  <div className="flex items-center">
                    <div className="h-px w-16 bg-gray-700"></div>
                    <span className="px-4 text-gray-400 text-xs">OR</span>
                    <div className="h-px w-16 bg-gray-700"></div>
                  </div>
                </div>
                
                <SampleFile className="w-full" />
                
                <div className="mt-5 text-gray-400 text-xs text-center pt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Your documents are processed securely</span>
                  </div>
                  <p>No account needed. No data stored.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Minimal footer */}
      <footer className="py-4 border-t border-gray-800/30 text-center text-sm text-gray-500 mt-auto">
        © 2023 Document Anonymizer · Privacy Policy · Terms of Service
      </footer>
    </main>
  );
}
