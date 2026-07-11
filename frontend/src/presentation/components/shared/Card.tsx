import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

// Reusable customizable UI Card layout component
export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm transition-all",
          hoverable
            ? "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 cursor-pointer duration-200"
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
