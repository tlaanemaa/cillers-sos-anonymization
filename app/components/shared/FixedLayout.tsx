import { ReactNode, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface FixedLayoutProps {
  documentContent: ReactNode;
  controlsContent: ReactNode;
  historyContent: ReactNode;
  resultsContent?: ReactNode;
  className?: string;
}

export default function FixedLayout({
  documentContent,
  controlsContent,
  resultsContent,
  historyContent,
  className = "",
}: FixedLayoutProps) {
  // Refs for measuring height
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = useState<number | null>(null);

  // Update height when controls panel height changes
  useEffect(() => {
    if (!controlsRef.current) return;
    
    // Create a resize observer to check for changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setControlsHeight(entry.contentRect.height);
      }
    });
    
    // Start observing the controls panel
    resizeObserver.observe(controlsRef.current);
    
    // Initial measurement
    setControlsHeight(controlsRef.current.offsetHeight);
    
    // Clean up the observer
    return () => resizeObserver.disconnect();
  }, [resultsContent]); // Re-initialize when results content changes

  return (
    <div className={twMerge("flex flex-col gap-4", className)}>      
      {/* Main Content Row - Document and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Document Panel - Left Side (65% width on large screens) */}
        <div 
          className="lg:w-[65%] bg-gray-900/30 rounded-xl shadow-xl overflow-auto" 
          style={{ 
            height: controlsHeight ? `${controlsHeight}px` : 'auto',
            minHeight: '50vh', // Fallback minimum height
            maxHeight: '80vh'  // Maximum height constraint
          }}
        >
          {documentContent}
        </div>
        
        {/* Controls Panel - Right Side (35% width on large screens) */}
        <div className="lg:w-[35%] flex flex-col gap-4" ref={controlsRef}>
          {/* Controls section */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/40">
            <div className="p-3">
              {controlsContent}
            </div>
          </div>
          
          {/* Results section - only visible when results are available */}
          {resultsContent && (
            <div className="bg-gray-800/30 rounded-xl border border-gray-700/40">
              <div className="p-3">
                {resultsContent}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* History Panel - Bottom (not scrollable) */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/40 p-3">
        {historyContent}
      </div>
    </div>
  );
} 
