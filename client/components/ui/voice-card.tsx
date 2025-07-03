import { cn } from "@/lib/utils";
import { NeumorphicCard } from "./neumorphic-card";
import { LanguageSelector } from "./language-selector";
import { Mic, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { type DeepLLanguage } from "@/services/deepl-languages";

interface VoiceCardProps {
  className?: string;
  isActive?: boolean;
  placeholder?: string;
  translationPlaceholder?: string;
  defaultFromLang?: string;
  defaultToLang?: string;
  showSwapButton?: boolean;
}

export function VoiceCard({
  className,
  isActive = false,
  placeholder = "Speak to translate",
  translationPlaceholder = "Translation will appear here",
  defaultFromLang = "EN",
  defaultToLang = "FR",
  showSwapButton = true,
}: VoiceCardProps) {
  const [fromLang, setFromLang] = useState(defaultFromLang);
  const [toLang, setToLang] = useState(defaultToLang);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recording
  };

  return (
    <NeumorphicCard
      className={cn("w-full max-w-md mx-auto space-y-6", className)}
    >
      {/* Language Selectors */}
      <div className="flex items-center justify-between gap-4">
        <LanguageSelector
          value={fromLang}
          onChange={(lang) => setFromLang(lang.code)}
        />

        {showSwapButton && (
          <button
            onClick={handleSwapLanguages}
            className="neu-button p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        )}

        <LanguageSelector
          value={toLang}
          onChange={(lang) => setToLang(lang.code)}
        />
      </div>

      {/* Input Text Area */}
      <div className="space-y-4">
        <div className="neu-input min-h-[60px] flex items-center">
          {transcript || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        {/* Translation Output */}
        <div className="neu-card-inset min-h-[60px] flex items-center px-6 py-4">
          {translation || (
            <span className="text-muted-foreground">
              {translationPlaceholder}
            </span>
          )}
        </div>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center">
        <button
          onClick={handleMicClick}
          className={cn(
            "neu-microphone relative",
            isListening && "shadow-neu-sm-inset",
            isActive && "animate-pulse",
          )}
        >
          <Mic
            className={cn(
              "h-6 w-6 transition-colors duration-200",
              isListening ? "text-bridgit-primary" : "text-muted-foreground",
            )}
          />
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-bridgit-primary/20 animate-ping" />
          )}
        </button>
      </div>

      {/* Status Text */}
      {isListening && (
        <div className="text-center">
          <p className="text-xs text-bridgit-primary font-medium animate-pulse">
            Listening...
          </p>
        </div>
      )}
    </NeumorphicCard>
  );
}
