import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status:
    | "disconnected"
    | "connecting"
    | "connected"
    | "speaking"
    | "translating";
  className?: string;
}

const statusConfig = {
  disconnected: {
    icon: "🔴",
    text: "Neural Link Offline",
    color: "text-red-400",
    glow: "shadow-red-500/30",
  },
  connecting: {
    icon: "🟡",
    text: "Establishing Connection...",
    color: "text-yellow-400",
    glow: "shadow-yellow-500/30",
  },
  connected: {
    icon: "🟢",
    text: "Neural Bridge Active",
    color: "text-bridgit-neon",
    glow: "shadow-bridgit-neon/30",
  },
  speaking: {
    icon: "🎤",
    text: "Voice Input Detected",
    color: "text-bridgit-primary",
    glow: "shadow-bridgit-primary/30",
  },
  translating: {
    icon: "⚡",
    text: "AI Processing...",
    color: "text-bridgit-secondary",
    glow: "shadow-bridgit-secondary/30",
  },
};

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-neubg/80 to-neulight/60",
        "backdrop-blur-xl border border-white/10 rounded-neu",
        "px-6 py-3 text-sm flex items-center gap-3",
        "shadow-[0_0_30px_-10px]",
        config.color,
        config.glow,
        (status === "connecting" || status === "translating") &&
          "animate-glow-pulse",
        className,
      )}
    >
      {/* Animated background for active states */}
      {(status === "speaking" || status === "translating") && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current/10 to-transparent animate-pulse" />
      )}

      <span className="text-lg relative z-10">{config.icon}</span>
      <span className="font-semibold tracking-wide relative z-10">
        {config.text}
      </span>

      {/* Pulse indicator for active states */}
      {(status === "connected" || status === "speaking") && (
        <div className="w-2 h-2 rounded-full bg-current animate-glow-pulse ml-2" />
      )}
    </div>
  );
}
