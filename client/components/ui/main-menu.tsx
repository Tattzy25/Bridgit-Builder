import { cn } from "@/lib/utils";
import { NeumorphicCard } from "./neumorphic-card";
import { NeumorphicButton } from "./neumorphic-button";
import {
  Settings,
  Mic,
  Users,
  UserPlus,
  Palette,
  Volume2,
  User,
  X,
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-foreground mb-6">
        Bridgit AI
      </h2>

      {/* Mode Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Mode
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NeumorphicButton
            variant={currentMode === "just-me" ? "primary" : "default"}
            onClick={() => onModeChange("just-me")}
            className="flex-col h-20 gap-2"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Just Me</span>
          </NeumorphicButton>
          <NeumorphicButton
            variant={currentMode === "talk-together" ? "primary" : "default"}
            onClick={() => onModeChange("talk-together")}
            className="flex-col h-20 gap-2"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Talk Together</span>
          </NeumorphicButton>
        </div>
      </div>

      {/* Session Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Session
        </h3>
        <div className="space-y-2">
          <NeumorphicButton className="w-full justify-start gap-3">
            <UserPlus className="h-4 w-4" />
            Host Session
          </NeumorphicButton>
          <NeumorphicButton className="w-full justify-start gap-3">
            <Users className="h-4 w-4" />
            Join Session
          </NeumorphicButton>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-3 gap-2">
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("voice")}
          className="flex-col h-16 gap-1"
        >
          <Volume2 className="h-4 w-4" />
          <span className="text-xs">Voice</span>
        </NeumorphicButton>
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("colors")}
          className="flex-col h-16 gap-1"
        >
          <Palette className="h-4 w-4" />
          <span className="text-xs">Colors</span>
        </NeumorphicButton>
        <NeumorphicButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("settings")}
          className="flex-col h-16 gap-1"
        >
          <Settings className="h-4 w-4" />
          <span className="text-xs">Settings</span>
        </NeumorphicButton>
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <NeumorphicCard className="w-full max-w-sm max-h-[85vh] overflow-y-auto animate-fade-in">
        {activeTab === "main" && renderMainTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "colors" && renderColorsTab()}
        {activeTab === "voice" && renderVoiceTab()}

        <div className="mt-6 pt-4 border-t border-border/20">
          <NeumorphicButton
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Close
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
}
