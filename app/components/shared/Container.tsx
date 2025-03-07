import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export default function Container({
  children,
  className = "",
  maxWidth = "xl",
}: ContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={twMerge(
        "w-full mx-auto px-4 sm:px-6 md:px-8",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
} 
