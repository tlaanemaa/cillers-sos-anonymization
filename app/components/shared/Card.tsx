import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
}

export default function Card({ 
  children, 
  className = "", 
  variant = "default" 
}: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-300";
  
  const variantStyles = {
    default: "bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 shadow-sm",
    elevated: "bg-gray-800/90 backdrop-blur-sm border border-gray-700/40 shadow-lg hover:shadow-xl hover:border-gray-600/40",
    outlined: "bg-gray-900/30 backdrop-blur-sm border border-gray-700/50"
  };
  
  return (
    <div className={twMerge(baseStyles, variantStyles[variant], "p-6", className)}>
      {children}
    </div>
  );
} 
