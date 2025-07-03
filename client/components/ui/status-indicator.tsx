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
    text: "Disconnected",
    color: "text-red-500",
  },
  connecting: {
    icon: "🟡",
    text: "Connecting...",
    color: "text-yellow-500",
  },
  connected: {
    icon: "🟢",
    text: "Connected",
    color: "text-green-500",
  },
  speaking: {
    icon: "🎤",
    text: "Speaking",
    color: "text-bridgit-primary",
  },
  translating: {
    icon: "⚡",
    text: "Translating...",
    color: "text-bridgit-secondary",
  },
};

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "neu-button px-4 py-2 text-sm flex items-center gap-2",
        config.color,
        status === "connecting" && "animate-pulse",
        className,
      )}
    >
      <span>{config.icon}</span>
      <span className="font-medium">{config.text}</span>
    </div>
  );
}
