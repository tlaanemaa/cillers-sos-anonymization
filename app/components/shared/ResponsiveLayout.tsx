import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface ResponsiveLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({
  leftContent,
  rightContent,
  className = "",
}: ResponsiveLayoutProps) {
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  
  return (
    <div className={twMerge("h-full flex-1 flex flex-col lg:flex-row gap-4", className)}>
      {/* Document area - takes most of the space */}
      <div className={`flex-1 flex justify-center transition-all duration-300 ${isControlsCollapsed ? 'lg:w-[calc(100%-48px)]' : ''}`}>
        <div className="w-full max-w-[900px] bg-transparent rounded-xl shadow-xl overflow-hidden">
          {leftContent}
        </div>
      </div>
      
      {/* Controls panel - collapsible on desktop */}
      <div className={`lg:relative transition-all duration-300 ${isControlsCollapsed ? 'lg:w-12' : 'lg:w-[350px]'} h-auto`}>
        <div className={`lg:sticky lg:top-4 transition-all duration-300 ${isControlsCollapsed ? 'lg:opacity-0 lg:invisible lg:w-0' : 'opacity-100 visible lg:w-[350px]'}`}>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/40">
            {rightContent}
          </div>
        </div>
        
        {/* Collapse/expand button - only visible on desktop */}
        <button 
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="hidden lg:flex absolute top-4 -left-3 bg-gray-800 border border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors z-10"
          aria-label={isControlsCollapsed ? "Expand controls" : "Collapse controls"}
          title={isControlsCollapsed ? "Expand controls" : "Collapse controls"}
        >
          <ChevronRightIcon className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isControlsCollapsed ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
} 
