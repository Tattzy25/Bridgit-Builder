import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import { LanguageSelector } from "./language-selector";
import { VoiceVisualizer } from "./voice-visualizer";
import { useVoiceFSM, VoiceState } from "@/hooks/use-voice-fsm";
import { Mic, ArrowLeftRight, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

interface CyberVoiceCardProps {
  className?: string;
  isActive?: boolean;
  defaultFromLang?: string;
  defaultToLang?: string;
  showSwapButton?: boolean;
  isRemoteSession?: boolean;
  userId?: "user1" | "user2";
  sessionCode?: string;
}

export function CyberVoiceCard({
  className,
  isActive = false,
  defaultFromLang = "EN",
  defaultToLang = "FR",
  showSwapButton = true,
  isRemoteSession = false,
  userId = "user1",
  sessionCode,
}: CyberVoiceCardProps) {
  const [fromLang, setFromLang] = useState(defaultFromLang);
  const [toLang, setToLang] = useState(defaultToLang);
  const [error, setError] = useState<string | null>(null);

  // Initialize Voice FSM
  const { state, data, isListening, toggleMicrophone } = useVoiceFSM({
    fromLang,
    toLang,
    isRemoteSession,
    userId,
    onStateChange: (newState: VoiceState) => {
      console.log(`Voice FSM: ${newState}`);
      // TODO: Publish state to Ably if remote session
    },
    onDataChange: (voiceData) => {
      console.log("Voice data updated:", voiceData);
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    },
  });

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const getConnectionStatus = () => {
    if (isRemoteSession && data.isConnected) {
      return {
        icon: Wifi,
        text: "LIVE",
        color: "from-bridgit-neon to-green-400",
      };
    } else if (isRemoteSession && !data.isConnected) {
      return {
        icon: WifiOff,
        text: "OFFLINE",
        color: "from-red-500 to-red-600",
      };
    } else {
      return { icon: null, text: "LOCAL", color: "from-muted/50 to-muted/70" };
    }
  };

  const status = getConnectionStatus();

  return (
    <HoloCard
      variant="premium"
      className={cn("w-full max-w-md mx-auto space-y-6 relative", className)}
      glow={state !== "IDLE"}
      animated={isActive}
    >
      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-4 right-16 bg-red-500/20 border border-red-500/50 rounded-neu px-3 py-2 text-xs text-red-300 z-20">
          {error}
        </div>
      )}

      {/* Connection Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div
          className={cn(
            "px-3 py-1 text-xs font-bold rounded-full shadow-lg border border-white/10 flex items-center gap-1",
            `bg-gradient-to-r ${status.color} text-white`,
          )}
        >
          {status.icon && <status.icon className="h-3 w-3" />}
          {status.text}
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
            disabled={state !== "IDLE"}
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

      {/* Voice Visualizer */}
      <VoiceVisualizer
        state={state}
        audioLevel={data.audioLevel}
        partialText={data.partialText}
        finalText={data.finalText}
        translatedText={data.translatedText}
      />

      {/* Main Microphone Button */}
      <div className="flex justify-center">
        <CyberButton
          onClick={toggleMicrophone}
          variant={
            isListening ? "neon" : state !== "IDLE" ? "primary" : "default"
          }
          size="xl"
          className={cn(
            "neu-microphone relative group",
            "hover:scale-110 active:scale-95",
            "transition-all duration-300",
            (isListening || state !== "IDLE") && "animate-glow-pulse",
          )}
          glow={isListening || state !== "IDLE"}
        >
          <Mic
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isListening || state !== "IDLE"
                ? "text-black scale-110"
                : "text-bridgit-primary",
            )}
          />

          {/* Pulse rings when active */}
          {(isListening || state !== "IDLE") && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-bridgit-neon/30 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border border-bridgit-neon/20 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </CyberButton>
      </div>

      {/* Session Status */}
      {isRemoteSession && sessionCode && (
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            <span>
              Session:{" "}
              <span className="font-mono text-bridgit-primary">
                {sessionCode}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Touchless Instructions */}
      {isListening && state === "IDLE" && (
        <div className="text-center">
          <div className="text-xs text-bridgit-neon animate-pulse">
            ✨ Touchless mode active - just start speaking!
          </div>
        </div>
      )}
    </HoloCard>
  );
}
