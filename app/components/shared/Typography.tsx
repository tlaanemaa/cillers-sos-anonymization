import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// Base typography props
interface TypographyProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

// PageTitle component (h1)
export function PageTitle({ children, className = "", gradient = false }: TypographyProps) {
  const baseStyles = "text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight";
  const textStyles = gradient 
    ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500" 
    : "text-slate-50";
  
  return (
    <h1 className={twMerge(baseStyles, textStyles, className)}>
      {children}
    </h1>
  );
}

// SectionTitle component (h2)
export function SectionTitle({ children, className = "", gradient = false }: TypographyProps) {
  const baseStyles = "text-2xl sm:text-3xl font-bold leading-tight";
  const textStyles = gradient 
    ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500" 
    : "text-slate-50";
  
  return (
    <h2 className={twMerge(baseStyles, textStyles, className)}>
      {children}
    </h2>
  );
}

// SubsectionTitle component (h3)
export function SubsectionTitle({ children, className = "", gradient = false }: TypographyProps) {
  const baseStyles = "text-xl font-semibold leading-tight";
  const textStyles = gradient 
    ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500" 
    : "text-slate-100";
  
  return (
    <h3 className={twMerge(baseStyles, textStyles, className)}>
      {children}
    </h3>
  );
}

// Text component (p)
export function Text({ children, className = "" }: TypographyProps) {
  return (
    <p className={twMerge("text-slate-300 leading-relaxed", className)}>
      {children}
    </p>
  );
}

// SmallText component (small text)
export function SmallText({ children, className = "" }: TypographyProps) {
  return (
    <p className={twMerge("text-xs text-slate-400 leading-relaxed", className)}>
      {children}
    </p>
  );
}

// Label component
export function Label({ children, className = "" }: TypographyProps) {
  return (
    <label className={twMerge("text-sm font-medium text-slate-300", className)}>
      {children}
    </label>
  );
} 
