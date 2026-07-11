import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Reusable customizable form Input component with focus ring animations
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label ? (
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          type={type}
          aria-invalid={!!error}
          className={twMerge(
            clsx(
              "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500/80 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100 dark:placeholder-gray-600 dark:focus:border-brand-500/80 transition-all duration-300",
              error ? "border-red-400 focus:border-red-400 focus:ring-red-400/10 dark:border-red-900/50" : ""
            ),
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-500 font-medium" role="alert">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
