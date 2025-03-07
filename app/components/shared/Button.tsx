"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  onClick,
  className = "",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const baseStyles = "flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 font-medium";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 shadow-sm",
    secondary: "bg-gray-800 border border-gray-700 text-slate-300 hover:bg-gray-700 hover:text-white"
  };
  
  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      onClick={onClick}
      className={twMerge(baseStyles, variantStyles[variant], widthStyles, disabledStyles, className)}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
} 
