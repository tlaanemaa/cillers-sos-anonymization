import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

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
  return (
    <div className={twMerge("h-full flex-1 flex flex-col lg:flex-row gap-4", className)}>
      {/* Document area - takes most of the space */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[900px] bg-transparent rounded-xl shadow-xl overflow-hidden">
          {leftContent}
        </div>
      </div>
      
      {/* Controls panel - fixed width on desktop */}
      <div className="lg:w-[350px] h-auto">
        <div className="lg:sticky lg:top-4">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/40">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
} 
