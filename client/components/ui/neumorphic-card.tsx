import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "inset";
  size?: "sm" | "md" | "lg" | "xl";
}

const NeumorphicCard = forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "p-4 rounded-neu shadow-neu-sm",
      md: "p-6 rounded-neu shadow-neu",
      lg: "p-8 rounded-neu-lg shadow-neu",
      xl: "p-10 rounded-neu-xl shadow-neu",
    };

    const variantClasses = {
      default: "shadow-neu",
      inset: "shadow-neu-inset",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-neubg",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
NeumorphicCard.displayName = "NeumorphicCard";

export { NeumorphicCard };
