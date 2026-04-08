import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-lg transition-all duration-200",
          {
            "bg-white border border-gray-200": variant === "default",
            "bg-white shadow-lg hover:shadow-xl": variant === "elevated",
            "bg-transparent border-2 border-gray-300": variant === "outlined",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
