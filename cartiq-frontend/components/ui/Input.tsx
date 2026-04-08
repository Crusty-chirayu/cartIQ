import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: "outline" | "filled";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      variant = "outline",
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("flex flex-col", { "w-full": fullWidth })}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            "px-4 py-2 text-base rounded-lg transition-all duration-200 focus:outline-none focus:ring-2",
            {
              "w-full": fullWidth,
              "border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500":
                variant === "outline" && !error,
              "bg-gray-100 border-0 focus:bg-white focus:ring-blue-500":
                variant === "filled" && !error,
              "border-2 border-red-500 focus:ring-red-500": error,
            },
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
