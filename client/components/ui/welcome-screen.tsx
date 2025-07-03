import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import { Users, User, Mic, Globe, Zap, Brain } from "lucide-react";

interface WelcomeScreenProps {
  onModeSelect: (mode: "just-me" | "talk-together") => void;
  onClose: () => void;
}

export function WelcomeScreen({ onModeSelect, onClose }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-slide-up">
      <HoloCard
        variant="premium"
        className="w-full max-w-2xl text-center space-y-8"
        glow
        animated
      >
        {/* Logo and Title */}
        <div className="space-y-6">
          <div className="flex justify-center relative">
            <div className="relative p-4 rounded-full bg-gradient-to-r from-bridgit-primary/20 to-bridgit-secondary/20 border border-white/10">
              <img
                src="https://cdn.builder.io/api/v1/assets/f211fb8c7c124ed3b265fee7bf5c0654/bridgit-ai-logo-e267fd?format=webp&width=800"
                alt="Bridgit AI"
                className="w-20 h-20 object-contain"
              />
              <div className="absolute inset-0 rounded-full border border-bridgit-primary/30 animate-glow-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4 animate-neon-glow">
              Welcome to Bridgit AI
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              The future of real-time voice translation. Break language barriers
              with cutting-edge AI technology.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="text-center p-6 bg-gradient-to-br from-bridgit-primary/10 to-transparent rounded-neu border border-white/5">
            <Brain className="h-12 w-12 text-bridgit-primary mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">Neural Translation</h3>
            <p className="text-xs text-muted-foreground">
              AI-powered real-time processing
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-bridgit-secondary/10 to-transparent rounded-neu border border-white/5">
            <Zap className="h-12 w-12 text-bridgit-secondary mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">Lightning Fast</h3>
            <p className="text-xs text-muted-foreground">
              Sub-second response times
            </p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-bridgit-accent/10 to-transparent rounded-neu border border-white/5">
            <Globe className="h-12 w-12 text-bridgit-accent mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">100+ Languages</h3>
            <p className="text-xs text-muted-foreground">
              Global communication barrier-free
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Choose Your Experience
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CyberButton
              onClick={() => onModeSelect("just-me")}
              variant="primary"
              className="flex-col h-32 gap-3 hover:scale-105 transition-all duration-300"
            >
              <User className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">Just Me</div>
                <div className="text-sm opacity-80">Solo Translation Mode</div>
              </div>
            </CyberButton>
            <CyberButton
              onClick={() => onModeSelect("talk-together")}
              variant="gold"
              className="flex-col h-32 gap-3 hover:scale-105 transition-all duration-300"
            >
              <Users className="h-8 w-8" />
              <div>
                <div className="font-bold text-lg">Talk Together</div>
                <div className="text-sm opacity-80">Live Conversation Mode</div>
              </div>
            </CyberButton>
          </div>
        </div>

        {/* Skip Button */}
        <div className="pt-6 border-t border-white/10">
          <CyberButton
            onClick={onClose}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Introduction
          </CyberButton>
        </div>
      </NeumorphicCard>
    </div>
  );
}