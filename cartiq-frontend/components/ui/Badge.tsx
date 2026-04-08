import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center font-medium rounded-full",
          {
            "bg-gray-200 text-gray-800": variant === "default",
            "bg-blue-200 text-blue-800": variant === "primary",
            "bg-green-200 text-green-800": variant === "success",
            "bg-yellow-200 text-yellow-800": variant === "warning",
            "bg-red-200 text-red-800": variant === "danger",
            "px-2 py-1 text-xs": size === "sm",
            "px-3 py-1 text-sm": size === "md",
            "px-4 py-1 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
