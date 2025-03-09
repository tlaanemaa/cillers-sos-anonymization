import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "7xl";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Container({
  children,
  className = "",
  maxWidth = "xl",
  padding = "md",
}: ContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm", // 640px
    md: "max-w-md", // 768px
    lg: "max-w-lg", // 1024px
    xl: "max-w-xl", // 1280px
    "2xl": "max-w-2xl", // 1536px
    "7xl": "max-w-7xl", // 1280px but wider
    full: "max-w-full", // 100%
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-3",
    md: "px-3 sm:px-4 md:px-6",
    lg: "px-4 sm:px-6 md:px-8 lg:px-12",
  };

  return (
    <div
      className={twMerge(
        "w-full mx-auto",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
} 
