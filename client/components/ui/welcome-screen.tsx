import { NeumorphicCard } from "./neumorphic-card";
import { NeumorphicButton } from "./neumorphic-button";
import { Users, User, Mic, Globe } from "lucide-react";

interface WelcomeScreenProps {
  onModeSelect: (mode: "just-me" | "talk-together") => void;
  onClose: () => void;
}

export function WelcomeScreen({ onModeSelect, onClose }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <NeumorphicCard className="w-full max-w-lg text-center space-y-6">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src="https://cdn.builder.io/api/v1/assets/f211fb8c7c124ed3b265fee7bf5c0654/bridgit-ai-logo-e267fd?format=webp&width=800"
              alt="Bridgit AI"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to Bridgit AI
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your real-time voice bridge that speaks your language for you —
              anywhere, instantly.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="text-center p-4">
            <Globe className="h-8 w-8 text-bridgit-primary mx-auto mb-2" />
            <h3 className="font-medium text-sm">Real-time Translation</h3>
          </div>
          <div className="text-center p-4">
            <Mic className="h-8 w-8 text-bridgit-secondary mx-auto mb-2" />
            <h3 className="font-medium text-sm">Voice First</h3>
          </div>
          <div className="text-center p-4">
            <Users className="h-8 w-8 text-bridgit-accent mx-auto mb-2" />
            <h3 className="font-medium text-sm">Connect Anywhere</h3>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Choose Your Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicButton
              onClick={() => onModeSelect("just-me")}
              className="flex-col h-20 gap-2 hover:shadow-neu-sm transition-all duration-200"
            >
              <User className="h-6 w-6 text-bridgit-primary" />
              <div>
                <div className="font-medium">Just Me</div>
                <div className="text-xs text-muted-foreground">Solo mode</div>
              </div>
            </NeumorphicButton>
            <NeumorphicButton
              onClick={() => onModeSelect("talk-together")}
              className="flex-col h-20 gap-2 hover:shadow-neu-sm transition-all duration-200"
            >
              <Users className="h-6 w-6 text-bridgit-secondary" />
              <div>
                <div className="font-medium">Talk Together</div>
                <div className="text-xs text-muted-foreground">
                  Two-person mode
                </div>
              </div>
            </NeumorphicButton>
          </div>
        </div>

        {/* Skip Button */}
        <div className="pt-4 border-t border-border/20">
          <NeumorphicButton
            onClick={onClose}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
}
