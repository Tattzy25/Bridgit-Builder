import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CyberButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "gold" | "neon" | "ghost";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  glow?: boolean;
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  (
    { className, variant = "default", size = "md", glow = false, ...props },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-16 px-8 text-lg font-semibold",
      xl: "h-20 px-10 text-xl font-bold",
      icon: "h-12 w-12",
    };

    const variantClasses = {
      default: "neu-button text-foreground",
      primary: cn(
        "relative overflow-hidden text-white font-bold tracking-wide",
        "bg-gradient-to-r from-bridgit-primary via-bridgit-secondary to-bridgit-accent",
        "border border-bridgit-primary/30",
        "shadow-[0_0_30px_-10px] shadow-bridgit-primary/40",
        "hover:shadow-[0_0_50px_-5px] hover:shadow-bridgit-primary/60",
        "hover:scale-105 active:scale-95",
        "transition-all duration-300",
      ),
      gold: cn(
        "relative overflow-hidden text-black font-bold tracking-wide",
        "bg-gradient-to-r from-bridgit-gold via-yellow-400 to-bridgit-gold",
        "border border-bridgit-gold/30",
        "shadow-[0_0_30px_-10px] shadow-bridgit-gold/40",
        "hover:shadow-[0_0_50px_-5px] hover:shadow-bridgit-gold/60",
        "hover:scale-105 active:scale-95",
        "transition-all duration-300",
      ),
      neon: cn(
        "relative overflow-hidden text-black font-bold tracking-wide",
        "bg-gradient-to-r from-bridgit-neon via-green-400 to-bridgit-neon",
        "border border-bridgit-neon/30",
        "shadow-[0_0_30px_-10px] shadow-bridgit-neon/40",
        "hover:shadow-[0_0_50px_-5px] hover:shadow-bridgit-neon/60",
        "hover:scale-105 active:scale-95",
        "transition-all duration-300",
      ),
      ghost: "hover:bg-white/5 hover:text-foreground border border-white/10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-neu font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
          sizeClasses[size],
          variantClasses[variant],
          glow && "animate-glow-pulse",
          className,
        )}
        {...props}
      >
        {variant === "primary" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
            <div className="absolute inset-0 rounded-neu bg-gradient-to-r from-bridgit-primary/20 to-bridgit-secondary/20" />
          </>
        )}
        {variant === "gold" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
            <div className="absolute inset-0 rounded-neu bg-gradient-to-r from-bridgit-gold/30 to-yellow-400/30" />
          </>
        )}
        <span className="relative z-10">{props.children}</span>
      </button>
    );
  },
);
CyberButton.displayName = "CyberButton";

export { CyberButton };
