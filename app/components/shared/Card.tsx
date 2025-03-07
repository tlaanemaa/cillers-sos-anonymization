import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={twMerge("bg-gray-900/50 p-6 rounded-xl border border-gray-700/30", className)}>
      {children}
    </div>
  );
} 
