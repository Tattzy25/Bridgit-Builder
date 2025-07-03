import { useState, useEffect } from "react";
import { CyberVoiceCard } from "@/components/ui/cyber-voice-card";
import { MainMenu } from "@/components/ui/main-menu";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { WelcomeScreen } from "@/components/ui/welcome-screen";
import { CyberButton } from "@/components/ui/cyber-button";
import { cn } from "@/lib/utils";

export default function Index() {
  const [mode, setMode] = useState<"just-me" | "talk-together">("just-me");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected" | "speaking" | "translating"
  >("disconnected");

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("bridgit-welcome-seen");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeModeSelect = (
    selectedMode: "just-me" | "talk-together",
  ) => {
    setMode(selectedMode);
    setShowWelcome(false);
    localStorage.setItem("bridgit-welcome-seen", "true");
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem("bridgit-welcome-seen", "true");
  };

  const handleModeChange = (newMode: "just-me" | "talk-together") => {
    setMode(newMode);
    setIsMenuOpen(false);
  };

  const BridgitLogo = () => (
    <CyberButton
      onClick={() => setIsMenuOpen(true)}
      variant="primary"
      size={mode === "just-me" ? "lg" : "xl"}
      className={cn(
        "relative group overflow-hidden",
        "shadow-[0_0_50px_-10px] shadow-bridgit-primary/50",
        "hover:shadow-[0_0_80px_-5px] hover:shadow-bridgit-primary/70",
        "transition-all duration-500 hover:scale-110",
        "animate-float",
      )}
      glow
    >
      <div className="relative z-10 flex items-center justify-center">
        <img
          src="https://cdn.builder.io/api/v1/assets/f211fb8c7c124ed3b265fee7bf5c0654/bridgit-ai-logo-e267fd?format=webp&width=800"
          alt="Bridgit AI"
          className="w-12 h-12 object-contain filter brightness-0 invert"
        />
      </div>

      {/* Holographic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-hologram-flicker" />

      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 group-hover:opacity-100 animate-ping" />
    </CyberButton>
  );

  const renderJustMeMode = () => (
    <div className="min-h-screen bg-neubg relative overflow-hidden">
      {/* Cyber background effects */}
      <div className="cyber-bg" />

      {/* Matrix rain effect */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-bridgit-primary text-xs animate-matrix-rain opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            01001010
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 space-y-12">
        {/* Logo at top */}
        <div className="animate-slide-up">
          <BridgitLogo />
        </div>

        {/* Single Voice Card */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CyberVoiceCard
            placeholder="🎤 Click to speak and translate instantly"
            translationPlaceholder="⚡ Your translation will appear here with lightning speed"
            className="w-full max-w-lg"
            isActive={status === "speaking" || status === "translating"}
          />
        </div>

        {/* Status Indicator */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <StatusIndicator status={status} />
        </div>

        {/* Premium features teaser */}
        <div
          className="animate-slide-up text-center space-y-2"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-sm text-muted-foreground">
            ✨ Premium: Voice Cloning • Real-time Sessions • 100+ Languages
          </p>
          <CyberButton variant="gold" size="sm" className="font-bold">
            Upgrade to Pro
          </CyberButton>
        </div>
      </div>
    </div>
  );

  const renderTalkTogetherMode = () => (
    <div className="min-h-screen bg-neubg relative overflow-hidden">
      {/* Cyber background effects */}
      <div className="cyber-bg" />

      {/* Connection beam effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-bridgit-primary/50 to-transparent animate-glow-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 gap-8">
        {/* Mobile: Stacked layout, Desktop: Side by side */}
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* First Voice Card */}
          <div className="animate-slide-up w-full lg:flex-1 max-w-lg">
            <CyberVoiceCard
              placeholder="🎤 Person 1: Speak here"
              translationPlaceholder="⚡ Translation for Person 2"
              defaultFromLang="EN"
              defaultToLang="FR"
              isActive={status === "speaking"}
            />
          </div>

          {/* Logo in center with connection effects */}
          <div
            className="animate-slide-up relative"
            style={{ animationDelay: "0.2s" }}
          >
            <BridgitLogo />

            {/* Connection pulse rings */}
            <div className="absolute inset-0 rounded-full border border-bridgit-primary/30 animate-ping" />
            <div
              className="absolute inset-0 rounded-full border border-bridgit-secondary/20 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Second Voice Card */}
          <div
            className="animate-slide-up w-full lg:flex-1 max-w-lg"
            style={{ animationDelay: "0.1s" }}
          >
            <CyberVoiceCard
              placeholder="🎤 Person 2: Speak here"
              translationPlaceholder="⚡ Translation for Person 1"
              defaultFromLang="FR"
              defaultToLang="EN"
              isActive={status === "translating"}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <StatusIndicator status={status} className="status-premium" />
        </div>

        {/* Session info */}
        <div
          className="animate-slide-up text-center space-y-2"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-sm text-muted-foreground">
            🔐 Session: B4F7X2 • End-to-End Encrypted • Real-time Sync
          </p>
          <div className="flex gap-2 justify-center">
            <CyberButton variant="neon" size="sm">
              Share Code
            </CyberButton>
            <CyberButton variant="ghost" size="sm">
              End Session
            </CyberButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mode === "just-me" ? renderJustMeMode() : renderTalkTogetherMode()}

      {showWelcome && (
        <WelcomeScreen
          onModeSelect={handleWelcomeModeSelect}
          onClose={handleWelcomeClose}
        />
      )}

      <MainMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onModeChange={handleModeChange}
        currentMode={mode}
      />
    </>
  );
}
