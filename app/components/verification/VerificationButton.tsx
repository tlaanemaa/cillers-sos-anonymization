// components/verification/VerificationButton.tsx
import { ReactNode } from "react";
import Button from "@/app/components/shared/Button";

type VerificationButtonProps = {
  title: string;
  onClick: () => void;
  isLoading: boolean;
  isDetected?: boolean; // Add this new prop
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "outline";
};

export default function VerificationButton({
  title,
  onClick,
  isLoading,
  isDetected = false, // Default to false
  icon,
  variant = "primary"
}: VerificationButtonProps) {
    // Change variant based on detection status
    const buttonVariant = isDetected ? "secondary" : variant;
  

  return (
    <Button
      onClick={onClick}
      variant={buttonVariant}
      className="flex items-center justify-center space-x-2 hover:shadow-md hover:shadow-indigo-900/30 transition-all"
      disabled={isLoading}
    >
      <span>{title}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </Button>
  );
}
