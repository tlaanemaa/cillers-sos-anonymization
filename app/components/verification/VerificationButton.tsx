// components/verification/VerificationButton.tsx
import { ReactNode } from "react";
import Button from "@/app/components/shared/Button";

type VerificationButtonProps = {
  title: string;
  onClick: () => Promise<void>;
  isLoading: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "outline";
};

export default function VerificationButton({
  title,
  onClick,
  isLoading,
  icon,
  variant = "primary"
}: VerificationButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className="flex items-center justify-center space-x-2 hover:shadow-md hover:shadow-indigo-900/30 transition-all"
      disabled={isLoading}
    >
      <span>{title}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </Button>
  );
}
