import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface IconWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function IconWrapper({ children, className = "" }: IconWrapperProps) {
  return (
    <span className={twMerge("inline-flex mr-3", className)}>
      {children}
    </span>
  );
} 
