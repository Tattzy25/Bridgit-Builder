import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "glass" | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  animated?: boolean;
}

const HoloCard = forwardRef<HTMLDivElement, HoloCardProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      glow = false,
      animated = false,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
    };

    const variantClasses = {
      default: "neu-card",
      premium: cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-neubg/90 via-neulight/80 to-neubg/90",
        "backdrop-blur-2xl border border-white/20",
        "shadow-[0_25px_50px_-12px] shadow-neushadow/50",
        "shadow-[inset_0_1px_0_0] shadow-white/10",
        "rounded-neu-lg",
      ),
      glass: cn(
        "relative overflow-hidden",
        "bg-white/5 backdrop-blur-2xl",
        "border border-white/10",
        "shadow-[0_25px_50px_-12px] shadow-black/25",
        "rounded-neu-lg",
      ),
      neon: cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-bridgit-primary/10 via-transparent to-bridgit-secondary/10",
        "backdrop-blur-xl border-2",
        "border-gradient-to-r from-bridgit-primary/50 to-bridgit-secondary/50",
        "shadow-[0_0_50px_-10px] shadow-bridgit-primary/30",
        "rounded-neu-lg",
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          glow && "animate-glow-pulse",
          animated && "animate-float",
          className,
        )}
        {...props}
      >
        {/* Holographic overlay */}
        {variant === "premium" && (
          <>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bridgit-primary/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 animate-hologram-flicker" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />
          </>
        )}

        {/* Neon border effect */}
        {variant === "neon" && (
          <div
            className="absolute inset-0 rounded-neu-lg border-2 border-transparent bg-gradient-to-r from-bridgit-primary via-bridgit-secondary to-bridgit-accent bg-clip-border animate-glow-pulse"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--neubg)), hsl(var(--neubg))) padding-box, linear-gradient(90deg, hsl(var(--bridgit-primary)), hsl(var(--bridgit-secondary))) border-box",
            }}
          />
        )}

        <div className="relative z-10">{props.children}</div>
      </div>
    );
  },
);
HoloCard.displayName = "HoloCard";

export { HoloCard };
