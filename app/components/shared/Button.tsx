"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export default function Button({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseStyles =
    "flex items-center justify-center rounded-xl font-medium transform-gpu";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 shadow-sm transition-colors duration-200",
    secondary:
      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-sm transition-colors duration-200",
    success:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm transition-colors duration-200",
    danger:
      "bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 shadow-sm transition-colors duration-200",
    outline:
      "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-colors duration-200",
    ghost:
      "bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors duration-200",
  };

  const sizeStyles = {
    sm: "text-xs py-1.5 px-3 gap-1.5",
    md: "text-sm py-2 px-4 gap-2",
    lg: "text-base py-2.5 px-5 gap-2.5",
  };

  const widthStyles = fullWidth ? "w-full" : "";
  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        disabledStyles,
        className
      )}
      disabled={disabled}
      type={type}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
