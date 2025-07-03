import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import { LanguageSelector } from "./language-selector";
import { Mic, ArrowLeftRight, Zap, Radio } from "lucide-react";
import { useState } from "react";

interface CyberVoiceCardProps {
  className?: string;
  isActive?: boolean;
  placeholder?: string;
  translationPlaceholder?: string;
  defaultFromLang?: string;
  defaultToLang?: string;
  showSwapButton?: boolean;
}

export function CyberVoiceCard({
  className,
  isActive = false,
  placeholder = "Speak to translate",
  translationPlaceholder = "Translation will appear here",
  defaultFromLang = "EN",
  defaultToLang = "FR",
  showSwapButton = true,
}: CyberVoiceCardProps) {
  const [fromLang, setFromLang] = useState(defaultFromLang);
  const [toLang, setToLang] = useState(defaultToLang);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setIsTranslating(true);
      // Simulate translation delay
      setTimeout(() => setIsTranslating(false), 2000);
    }
  };

  return (
    <HoloCard
      variant="premium"
      className={cn("w-full max-w-md mx-auto space-y-6 relative", className)}
      glow={isActive}
      animated={isActive}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            isListening ? "bg-bridgit-neon animate-glow-pulse" : "bg-muted/30",
          )}
        />
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

      {/* Input Text Area */}
      <div className="space-y-4">
        <div
          className={cn(
            "neu-input min-h-[80px] flex items-center relative overflow-hidden",
            isListening &&
              "border-bridgit-primary/50 shadow-[0_0_30px_-10px] shadow-bridgit-primary/40",
          )}
        >
          {isListening && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-primary/10 via-transparent to-bridgit-primary/10 animate-pulse" />
          )}
          <div className="relative z-10 w-full">
            {transcript || (
              <span className="text-muted-foreground/70 text-sm">
                {placeholder}
              </span>
            )}
          </div>
          {isListening && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Radio className="h-4 w-4 text-bridgit-primary animate-pulse" />
            </div>
          )}
        </div>

        {/* Translation Output */}
        <div
          className={cn(
            "neu-card-inset min-h-[80px] flex items-center px-6 py-4 relative overflow-hidden",
            isTranslating && "border-bridgit-secondary/50",
          )}
        >
          {isTranslating && (
            <div className="absolute inset-0 bg-gradient-to-r from-bridgit-secondary/10 via-transparent to-bridgit-secondary/10 animate-pulse" />
          )}
          <div className="relative z-10 w-full">
            {translation || (
              <span className="text-muted-foreground/50 text-sm">
                {translationPlaceholder}
              </span>
            )}
          </div>
          {isTranslating && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Zap className="h-4 w-4 text-bridgit-secondary animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center">
        <CyberButton
          onClick={handleMicClick}
          variant={isListening ? "neon" : "default"}
          size="xl"
          className={cn(
            "neu-microphone relative group",
            "hover:scale-110 active:scale-95",
            "transition-all duration-300",
            isListening && "animate-glow-pulse",
          )}
          glow={isListening}
        >
          <Mic
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isListening ? "text-black scale-110" : "text-bridgit-primary",
            )}
          />

          {/* Pulse rings when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-bridgit-neon/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border border-bridgit-neon/20 animate-ping animation-delay-75" />
            </>
          )}
        </CyberButton>
      </div>

      {/* Status Text */}
      {(isListening || isTranslating) && (
        <div className="text-center">
          <p
            className={cn(
              "text-sm font-medium animate-neon-glow",
              isListening ? "text-bridgit-neon" : "text-bridgit-secondary",
            )}
          >
            {isListening ? "🎤 Listening..." : "⚡ Translating..."}
          </p>
        </div>
      )}

      {/* Premium badge */}
      <div className="absolute -top-2 -right-2">
        <div className="px-2 py-1 text-xs font-bold text-black bg-gradient-to-r from-bridgit-gold to-yellow-400 rounded-full shadow-lg">
          AI
        </div>
      </div>
    </HoloCard>
  );
}
