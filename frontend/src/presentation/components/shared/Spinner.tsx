import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Reusable customizable loading Spinner indicator
export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4"
  };

  return (
    <div
      className={twMerge(
        clsx("animate-spin rounded-full border-brand-500 border-t-transparent", sizes[size]),
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
};
