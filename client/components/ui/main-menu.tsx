import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import {
  Settings,
  Mic,
  Users,
  UserPlus,
  Palette,
  Volume2,
  User,
  X,
  Crown,
  Zap,
  Brain,
  Shield,
} from "lucide-react";
import { useState } from "react";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onModeChange: (mode: "just-me" | "talk-together") => void;
  currentMode: "just-me" | "talk-together";
}

export function MainMenu({
  isOpen,
  onClose,
  onModeChange,
  currentMode,
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<
    "main" | "settings" | "colors" | "voice"
  >("main");

  if (!isOpen) return null;

  const renderMainTab = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground animate-neon-glow">
          Bridgit AI
        </h2>
        <p className="text-xs text-muted-foreground">Neural Translation Hub</p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-bridgit-primary uppercase tracking-wider flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Mode
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <CyberButton
            variant={currentMode === "just-me" ? "primary" : "default"}
            onClick={() => onModeChange("just-me")}
            className="flex-col h-24 gap-2"
          >
            <User className="h-6 w-6" />
            <span className="text-sm font-medium">Just Me</span>
          </CyberButton>
          <CyberButton
            variant={currentMode === "talk-together" ? "gold" : "default"}
            onClick={() => onModeChange("talk-together")}
            className="flex-col h-24 gap-2"
          >
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Talk Together</span>
          </CyberButton>
        </div>
      </div>

      {/* Session Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-bridgit-secondary uppercase tracking-wider flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Session Control
        </h3>
        <div className="space-y-3">
          <CyberButton variant="neon" className="w-full justify-start gap-3">
            <UserPlus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Host Session</div>
              <div className="text-xs opacity-80">Create secure room</div>
            </div>
          </CyberButton>
          <CyberButton variant="primary" className="w-full justify-start gap-3">
            <Users className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Join Session</div>
              <div className="text-xs opacity-80">Enter room code</div>
            </div>
          </CyberButton>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-3 gap-3">
        <CyberButton
          variant="ghost"
          onClick={() => setActiveTab("voice")}
          className="flex-col h-20 gap-2 hover:bg-bridgit-primary/10"
        >
          <Volume2 className="h-5 w-5 text-bridgit-primary" />
          <span className="text-xs font-medium">Voice</span>
        </CyberButton>
        <CyberButton
          variant="ghost"
          onClick={() => setActiveTab("colors")}
          className="flex-col h-20 gap-2 hover:bg-bridgit-secondary/10"
        >
          <Palette className="h-5 w-5 text-bridgit-secondary" />
          <span className="text-xs font-medium">Theme</span>
        </CyberButton>
        <CyberButton
          variant="ghost"
          onClick={() => setActiveTab("settings")}
          className="flex-col h-20 gap-2 hover:bg-bridgit-accent/10"
        >
          <Settings className="h-5 w-5 text-bridgit-accent" />
          <span className="text-xs font-medium">Premium</span>
        </CyberButton>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </NeumorphicButton>
      </div>

      <div className="space-y-3">
        <NeumorphicButton className="w-full justify-start gap-3">
          <Mic className="h-4 w-4" />
          Clone Your Voice (Premium)
        </NeumorphicButton>
        <NeumorphicButton className="w-full justify-start gap-3">
          <Volume2 className="h-4 w-4" />
          Voice Library
        </NeumorphicButton>
        <NeumorphicButton className="w-full justify-start gap-3">
          <Settings className="h-4 w-4" />
          Account Settings
        </NeumorphicButton>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Customize Colors</h2>
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </NeumorphicButton>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Primary Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[
              "#8B5CF6",
              "#06B6D4",
              "#10B981",
              "#F59E0B",
              "#EF4444",
              "#EC4899",
            ].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full shadow-neu-xs"
                style={{ backgroundColor: color }}
                onClick={() => {
                  document.documentElement.style.setProperty(
                    "--bridgit-primary",
                    `${color}`,
                  );
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Background
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[
              "#F1F5F9",
              "#E2E8F0",
              "#CBD5E1",
              "#94A3B8",
              "#64748B",
              "#475569",
            ].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full shadow-neu-xs"
                style={{ backgroundColor: color }}
                onClick={() => {
                  // Convert hex to HSL for CSS variables
                  document.documentElement.style.setProperty(
                    "--neubg",
                    `${color}`,
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Voice Settings</h2>
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </NeumorphicButton>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Basic Voices
        </h3>
        {["Alloy", "Echo", "Fable", "Onyx", "Nova", "Shimmer"].map((voice) => (
          <NeumorphicButton key={voice} className="w-full justify-start">
            {voice}
          </NeumorphicButton>
        ))}

        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mt-6">
          Premium Voices
        </h3>
        {["Rachel", "Drew", "Clyde", "Paul"].map((voice) => (
          <NeumorphicButton
            key={voice}
            className="w-full justify-start opacity-60"
          >
            {voice} (Premium)
          </NeumorphicButton>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-slide-up">
      <HoloCard
        variant="premium"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        glow
        animated
      >
        {activeTab === "main" && renderMainTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "colors" && renderColorsTab()}
        {activeTab === "voice" && renderVoiceTab()}

        <div className="mt-8 pt-6 border-t border-white/10">
          <CyberButton
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Close Neural Hub
          </CyberButton>
        </div>
      </HoloCard>
    </div>
  );
}
