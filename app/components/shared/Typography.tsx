import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// Base typography props
interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// PageTitle component (h1)
export function PageTitle({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={twMerge("text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500", className)}>
      {children}
    </h1>
  );
}

// SectionTitle component (h2)
export function SectionTitle({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={twMerge("text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500", className)}>
      {children}
    </h2>
  );
}

// SubsectionTitle component (h3)
export function SubsectionTitle({ children, className = "" }: TypographyProps) {
  return (
    <h3 className={twMerge("text-lg font-medium text-slate-100", className)}>
      {children}
    </h3>
  );
}

// Text component (p)
export function Text({ children, className = "" }: TypographyProps) {
  return (
    <p className={twMerge("text-slate-300", className)}>
      {children}
    </p>
  );
}

// SmallText component (small text)
export function SmallText({ children, className = "" }: TypographyProps) {
  return (
    <p className={twMerge("text-xs text-slate-400", className)}>
      {children}
    </p>
  );
} 
