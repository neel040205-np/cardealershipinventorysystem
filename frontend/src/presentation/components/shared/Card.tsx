import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

// Reusable customizable UI Card layout component with premium dark-mode glow and interactions
export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-gray-900/60 transition-all duration-300 ease-out",
          hoverable
            ? "hover:-translate-y-1 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/40 hover:border-brand-500/30 dark:hover:border-brand-500/20 cursor-pointer"
            : ""
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
