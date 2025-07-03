import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import { LanguageSelector } from "./language-selector";
import { Mic, ArrowLeftRight, Zap, Radio } from "lucide-react";
import { useState } from "react";

interface CyberVoiceCardProps {
  className?: string;
  isActive?: boolean;
  defaultFromLang?: string;
  defaultToLang?: string;
  showSwapButton?: boolean;
  isRemoteSession?: boolean;
  userId?: "user1" | "user2";
}

export function CyberVoiceCard({
  className,
  isActive = false,
  defaultFromLang = "EN",
  defaultToLang = "FR",
  showSwapButton = true,
  isRemoteSession = false,
  userId = "user1",
}: CyberVoiceCardProps) {
  const [fromLang, setFromLang] = useState(defaultFromLang);
  const [toLang, setToLang] = useState(defaultToLang);
  const [voiceStatus, setVoiceStatus] = useState<
    "idle" | "listening" | "processing" | "speaking" | "sending"
  >("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(isRemoteSession);

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const handleMicClick = () => {
    if (voiceStatus === "idle") {
      setVoiceStatus("listening");
      // Start voice recording
      setTimeout(() => {
        setVoiceStatus("processing");
        setTimeout(() => {
          if (isRemoteSession) {
            setVoiceStatus("sending");
            setTimeout(() => setVoiceStatus("idle"), 1000);
          } else {
            setVoiceStatus("speaking");
            setTimeout(() => setVoiceStatus("idle"), 2000);
          }
        }, 1500);
      }, 2000);
    } else {
      setVoiceStatus("idle");
    }
  };

  const getStatusText = () => {
    switch (voiceStatus) {
      case "listening":
        return "🎤 Listening...";
      case "processing":
        return "⚡ Processing...";
      case "speaking":
        return "🔊 Speaking...";
      case "sending":
        return "📡 Sending...";
      default:
        return isConnected ? "🟢 Ready" : "⚪ Local Mode";
    }
  };

  const getStatusColor = () => {
    switch (voiceStatus) {
      case "listening":
        return "text-bridgit-neon";
      case "processing":
        return "text-bridgit-secondary";
      case "speaking":
        return "text-bridgit-accent";
      case "sending":
        return "text-bridgit-primary";
      default:
        return isConnected ? "text-bridgit-neon" : "text-muted-foreground";
    }
  };

  return (
    <HoloCard
      variant="premium"
      className={cn("w-full max-w-md mx-auto space-y-6 relative", className)}
      glow={voiceStatus !== "idle"}
      animated={isActive}
    >
      {/* Voice Status indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold border border-white/10 backdrop-blur-sm",
            "bg-neubg/50 transition-all duration-300",
            getStatusColor(),
          )}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Language Selectors */}
      <div className="flex items-center justify-between gap-4">
        <LanguageSelector
          value={fromLang}
          onChange={(lang) => setFromLang(lang.code)}
          className="flex-1"
        />

        {showSwapButton && (
          <CyberButton
            onClick={handleSwapLanguages}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:rotate-180 transition-transform duration-500"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </CyberButton>
        )}

        <LanguageSelector
          value={toLang}
          onChange={(lang) => setToLang(lang.code)}
          className="flex-1"
        />
      </div>

      {/* Voice Activity Display */}
      <div className="space-y-4">
        {/* Input Voice Level */}
        <div
          className={cn(
            "neu-input min-h-[80px] flex items-center justify-center relative overflow-hidden",
            voiceStatus === "listening" &&
              "border-bridgit-neon/50 shadow-[0_0_30px_-10px] shadow-bridgit-neon/40",
          )}
        >
          {voiceStatus === "listening" && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-neon/10 via-transparent to-bridgit-neon/10 animate-pulse" />
          )}

          {/* Voice Level Bars */}
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 rounded-full transition-all duration-150",
                  voiceStatus === "listening"
                    ? "bg-bridgit-neon"
                    : "bg-muted/20",
                )}
                style={{
                  height:
                    voiceStatus === "listening"
                      ? `${Math.random() * 40 + 10}px`
                      : "4px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">
            {userId === "user1" ? "You" : "Remote User"}
          </div>
        </div>

        {/* Output Voice Level */}
        <div
          className={cn(
            "neu-card-inset min-h-[80px] flex items-center justify-center relative overflow-hidden",
            voiceStatus === "speaking" && "border-bridgit-accent/50",
          )}
        >
          {voiceStatus === "speaking" && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-accent/10 via-transparent to-bridgit-accent/10 animate-pulse" />
          )}

          {/* Output Level Bars */}
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 rounded-full transition-all duration-150",
                  voiceStatus === "speaking"
                    ? "bg-bridgit-accent"
                    : "bg-muted/10",
                )}
                style={{
                  height:
                    voiceStatus === "speaking"
                      ? `${Math.random() * 40 + 10}px`
                      : "4px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">
            {toLang} Output
          </div>
        </div>
      </div>

      {/* Microphone Button - Moved to top level */}
      <CyberButton
        onClick={handleMicClick}
        variant={voiceStatus !== "idle" ? "neon" : "default"}
        size="xl"
        className={cn(
          "neu-microphone relative group",
          "hover:scale-110 active:scale-95",
          "transition-all duration-300",
          voiceStatus !== "idle" && "animate-glow-pulse",
        )}
        glow={voiceStatus !== "idle"}
      >
        <Mic
          className={cn(
            "h-8 w-8 transition-all duration-300",
            voiceStatus !== "idle"
              ? "text-black scale-110"
              : "text-bridgit-primary",
          )}
        />

        {/* Pulse rings when active */}
        {voiceStatus !== "idle" && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-bridgit-neon/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-bridgit-neon/20 animate-ping animation-delay-75" />
          </>
        )}
      </CyberButton>

      {/* Connection Status Badge */}
      <div className="absolute -top-2 -right-2">
        <div
          className={cn(
            "px-2 py-1 text-xs font-bold rounded-full shadow-lg border border-white/10",
            isConnected
              ? "text-black bg-gradient-to-r from-bridgit-neon to-green-400"
              : "text-white bg-gradient-to-r from-muted/50 to-muted/70",
          )}
        >
          {isConnected ? "LIVE" : "LOCAL"}
        </div>
      </div>
    </HoloCard>
  );
}
