import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function Card({ 
  title, 
  icon, 
  children, 
  className = "",
  action
}: CardProps) {
  return (
    <div className={twMerge("bg-gray-900 border border-gray-800 rounded-lg h-full flex flex-col", className)}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <h3 className="font-medium text-gray-200">{title}</h3>
          </div>
          {action && (
            <div className="flex-shrink-0 z-20">
              {action}
            </div>
          )}
        </div>
      )}
      <div className="relative flex-grow overflow-auto">
        {children}
      </div>
    </div>
  );
} 
