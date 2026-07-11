import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Reusable customizable form Input component using ref forwarding for React Hook Form integration
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          type={type}
          className={twMerge(
            clsx(
              "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500",
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""
            ),
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
