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
    <div className={twMerge("flex flex-col md:flex-row gap-8", className)}>
      {/* Left column on desktop, top on mobile */}
      <div className="flex-1 order-1">
        {leftContent}
      </div>
      
      {/* Right column on desktop, bottom on mobile */}
      <div className="md:w-80 flex flex-col gap-8 order-2">
        {rightContent}
      </div>
    </div>
  );
} 
