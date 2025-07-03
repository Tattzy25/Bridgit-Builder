import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface NeumorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-sm rounded-neu",
      md: "h-11 px-6 text-base rounded-neu",
      lg: "h-14 px-8 text-lg rounded-neu-lg",
      icon: "h-12 w-12 rounded-neu",
    };

    const variantClasses = {
      default: "neu-button text-foreground hover:text-foreground/80",
      primary:
        "bg-gradient-to-r from-bridgit-primary to-bridgit-secondary text-white shadow-neu hover:shadow-neu-sm active:shadow-neu-inset",
      ghost: "hover:bg-neubg/50 hover:text-foreground",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
NeumorphicButton.displayName = "NeumorphicButton";

export { NeumorphicButton };
