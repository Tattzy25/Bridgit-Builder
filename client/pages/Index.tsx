import { useState } from "react";
import { VoiceCard } from "@/components/ui/voice-card";
import { MainMenu } from "@/components/ui/main-menu";
import { cn } from "@/lib/utils";

export default function Index() {
  const [mode, setMode] = useState<"just-me" | "talk-together">("just-me");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleModeChange = (newMode: "just-me" | "talk-together") => {
    setMode(newMode);
    setIsMenuOpen(false);
  };

  const BridgitLogo = () => (
    <button
      onClick={() => setIsMenuOpen(true)}
      className={cn(
        "neu-button flex items-center justify-center transition-all duration-300 hover:scale-105",
        mode === "just-me" ? "w-16 h-16" : "w-20 h-20",
      )}
    >
      <img
        src="https://cdn.builder.io/api/v1/assets/f211fb8c7c124ed3b265fee7bf5c0654/bridgit-ai-logo-e267fd?format=webp&width=800"
        alt="Bridgit AI"
        className="w-10 h-10 object-contain"
      />
    </button>
  );

  const renderJustMeMode = () => (
    <div className="min-h-screen bg-neubg flex flex-col items-center justify-center p-4 space-y-8">
      {/* Logo at top */}
      <div className="animate-fade-in">
        <BridgitLogo />
      </div>

      {/* Single Voice Card */}
      <div className="animate-fade-in">
        <VoiceCard
          placeholder="Enter text to translate"
          translationPlaceholder="Translation will appear here"
          className="w-full max-w-md"
        />
      </div>

      {/* Status Indicator */}
      {isConnected && (
        <div className="animate-fade-in">
          <div className="neu-button px-4 py-2 text-sm text-green-600">
            🟢 Connected
          </div>
        </div>
      )}
    </div>
  );

  const renderTalkTogetherMode = () => (
    <div className="min-h-screen bg-neubg flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      {/* First Voice Card */}
      <div className="animate-fade-in flex-1 max-w-md">
        <VoiceCard
          placeholder="Enter text to translate"
          translationPlaceholder="Translation will appear here"
          defaultFromLang="EN"
          defaultToLang="FR"
        />
      </div>

      {/* Logo in center */}
      <div className="animate-fade-in">
        <BridgitLogo />
      </div>

      {/* Second Voice Card */}
      <div className="animate-fade-in flex-1 max-w-md">
        <VoiceCard
          placeholder="Enter text to translate"
          translationPlaceholder="Translation will appear here"
          defaultFromLang="FR"
          defaultToLang="EN"
        />
      </div>

      {/* Status Indicator */}
      {isConnected && (
        <div className="absolute bottom-8 animate-fade-in">
          <div className="neu-button px-4 py-2 text-sm text-green-600">
            🟢 Both Connected
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {mode === "just-me" ? renderJustMeMode() : renderTalkTogetherMode()}

      <MainMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onModeChange={handleModeChange}
        currentMode={mode}
      />

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neubg via-transparent to-neubg opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-bridgit-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-bridgit-secondary/5 rounded-full blur-3xl" />
      </div>
    </>
  );
}
