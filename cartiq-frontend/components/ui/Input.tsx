import React, { InputHTMLAttributes, useId } from "react";
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
    const generatedId = useId();
    const inputId = id || generatedId;

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
            "px-4 py-3 text-base text-gray-900 placeholder-gray-500 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 font-medium",
            {
              "w-full": fullWidth,
              "bg-white border-2 border-gray-400 focus:border-blue-600 focus:ring-blue-500 focus:ring-opacity-50":
                variant === "outline" && !error,
              "bg-white border-2 border-gray-300 focus:bg-white focus:border-blue-600 focus:ring-blue-500 focus:ring-opacity-50":
                variant === "filled" && !error,
              "bg-red-50 border-2 border-red-500 text-red-900 focus:border-red-600 focus:ring-red-500 focus:ring-opacity-50": error,
            },
            className
          )}
          placeholder={props.placeholder || ""}
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