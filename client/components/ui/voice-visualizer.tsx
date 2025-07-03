import { cn } from "@/lib/utils";
import { VoiceState } from "@/hooks/use-voice-fsm";
import { Mic, Volume2, Zap, Radio, Loader2 } from "lucide-react";

interface VoiceVisualizerProps {
  state: VoiceState;
  audioLevel: number;
  partialText: string;
  finalText: string;
  translatedText: string;
  className?: string;
}

export function VoiceVisualizer({
  state,
  audioLevel,
  partialText,
  finalText,
  translatedText,
  className,
}: VoiceVisualizerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Voice Level Bars */}
      <div className="flex items-center justify-center gap-1 h-20">
        {[...Array(12)].map((_, i) => {
          const isActive = state === "RECORDING";
          const barHeight = isActive
            ? Math.max(4, audioLevel * 60 + Math.random() * 20)
            : 4;

          return (
            <div
              key={i}
              className={cn(
                "w-2 rounded-full transition-all duration-150",
                isActive ? "bg-bridgit-neon animate-pulse" : "bg-muted/20",
              )}
              style={{
                height: `${barHeight}px`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          );
        })}
      </div>

      {/* State Indicator */}
      <div className="text-center">
        <StateIndicator state={state} />
      </div>

      {/* Text Display */}
      <div className="space-y-3">
        {/* Input/Transcription Text */}
        <div
          className={cn(
            "neu-input min-h-[60px] flex items-center relative overflow-hidden transition-all duration-300",
            state === "RECORDING" &&
              "border-bridgit-neon/50 shadow-[0_0_30px_-10px] shadow-bridgit-neon/40",
            state === "TRANSCRIBING" &&
              "border-bridgit-secondary/50 shadow-[0_0_30px_-10px] shadow-bridgit-secondary/40",
          )}
        >
          {(state === "RECORDING" || state === "TRANSCRIBING") && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-neon/10 via-transparent to-bridgit-neon/10 animate-pulse" />
          )}

          <div className="relative z-10 w-full">
            {partialText || finalText ? (
              <span className="text-foreground">
                {partialText || finalText}
              </span>
            ) : (
              <span className="text-muted-foreground/70 text-sm">
                {getInputPlaceholder(state)}
              </span>
            )}
          </div>

          {/* State icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <StateIcon state={state} />
          </div>
        </div>

        {/* Translation Output */}
        <div
          className={cn(
            "neu-card-inset min-h-[60px] flex items-center px-6 py-4 relative overflow-hidden transition-all duration-300",
            state === "TRANSLATING" &&
              "border-bridgit-accent/50 shadow-[0_0_30px_-10px] shadow-bridgit-accent/40",
            state === "SPEAKING" &&
              "border-bridgit-primary/50 shadow-[0_0_30px_-10px] shadow-bridgit-primary/40",
          )}
        >
          {(state === "TRANSLATING" || state === "SPEAKING") && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-accent/10 via-transparent to-bridgit-accent/10 animate-pulse" />
          )}

          <div className="relative z-10 w-full">
            {translatedText ? (
              <span className="text-foreground">{translatedText}</span>
            ) : (
              <span className="text-muted-foreground/50 text-sm">
                {getOutputPlaceholder(state)}
              </span>
            )}
          </div>

          {/* Output state icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <OutputStateIcon state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StateIndicator({ state }: { state: VoiceState }) {
  const config = {
    IDLE: {
      icon: "⚪",
      text: "Ready to listen",
      color: "text-muted-foreground",
    },
    RECORDING: {
      icon: "🎤",
      text: "Listening...",
      color: "text-bridgit-neon animate-pulse",
    },
    TRANSCRIBING: {
      icon: "📝",
      text: "Processing speech...",
      color: "text-bridgit-secondary animate-pulse",
    },
    TRANSLATING: {
      icon: "⚡",
      text: "Translating...",
      color: "text-bridgit-accent animate-pulse",
    },
    SPEAKING: {
      icon: "🔊",
      text: "Playing translation",
      color: "text-bridgit-primary animate-pulse",
    },
  };

  const { icon, text, color } = config[state];

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", color)}>
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StateIcon({ state }: { state: VoiceState }) {
  const iconProps = "h-4 w-4 animate-pulse";

  switch (state) {
    case "RECORDING":
      return <Radio className={cn(iconProps, "text-bridgit-neon")} />;
    case "TRANSCRIBING":
      return (
        <Loader2
          className={cn(iconProps, "text-bridgit-secondary animate-spin")}
        />
      );
    default:
      return null;
  }
}

function OutputStateIcon({ state }: { state: VoiceState }) {
  const iconProps = "h-4 w-4 animate-pulse";

  switch (state) {
    case "TRANSLATING":
      return <Zap className={cn(iconProps, "text-bridgit-accent")} />;
    case "SPEAKING":
      return <Volume2 className={cn(iconProps, "text-bridgit-primary")} />;
    default:
      return null;
  }
}

function getInputPlaceholder(state: VoiceState): string {
  switch (state) {
    case "IDLE":
      return "🎤 Click microphone to start voice translation";
    case "RECORDING":
      return "🎤 Listening for your voice...";
    case "TRANSCRIBING":
      return "📝 Converting speech to text...";
    default:
      return "Ready for voice input";
  }
}

function getOutputPlaceholder(state: VoiceState): string {
  switch (state) {
    case "IDLE":
      return "Translation will appear here";
    case "TRANSLATING":
      return "⚡ Translating your message...";
    case "SPEAKING":
      return "🔊 Playing translated audio...";
    default:
      return "Translated text will appear here";
  }
}
