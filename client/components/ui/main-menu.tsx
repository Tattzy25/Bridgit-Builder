import { cn } from "@/lib/utils";
import { HoloCard } from "./holo-card";
import { CyberButton } from "./cyber-button";
import { PricingMenu } from "./pricing-menu";
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
  CreditCard,
} from "lucide-react";
import { useState } from "react";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onModeChange: (mode: "just-me" | "talk-together") => void;
  currentMode: "just-me" | "talk-together";
  sessionCode?: string | null;
  isConnected?: boolean;
  onHostSession?: () => void;
  onJoinSession?: () => void;
  onEndSession?: () => void;
}

export function MainMenu({
  isOpen,
  onClose,
  onModeChange,
  currentMode,
  sessionCode = null,
  isConnected = false,
  onHostSession = () => {},
  onJoinSession = () => {},
  onEndSession = () => {},
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<
    "main" | "settings" | "colors" | "voice" | "pricing"
  >("main");

  if (!isOpen) return null;

  const renderMainTab = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground animate-neon-glow">
          Bridgit AI
        </h2>
        <p className="text-xs text-muted-foreground">Neural Translation Hub</p>

        {/* Status Section */}
        <div className="mt-4 p-3 rounded-neu bg-neubg/30 border border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected
                  ? "bg-bridgit-neon animate-glow-pulse"
                  : "bg-muted/50",
              )}
            />
            <span
              className={cn(
                "font-medium",
                isConnected ? "text-bridgit-neon" : "text-muted-foreground",
              )}
            >
              {isConnected ? "Neural Link Active" : "Neural Link Offline"}
            </span>
          </div>

          {sessionCode && (
            <div className="mt-2 text-xs text-center">
              <span className="text-muted-foreground">Session: </span>
              <span className="font-mono text-bridgit-primary">
                {sessionCode}
              </span>
            </div>
          )}

          {isConnected && (
            <div className="mt-2 text-xs text-center text-muted-foreground">
              🔐 End-to-End Encrypted • Real-time Sync
            </div>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-bridgit-primary uppercase tracking-wider flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Mode
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <CyberButton
            variant={currentMode === "just-me" ? "primary" : "default"}
            onClick={() => onModeChange("just-me")}
            className="flex-col h-28 gap-3 rounded-xl"
          >
            <User className="h-7 w-7" />
            <span className="text-sm font-medium">Just Me</span>
          </CyberButton>
          <CyberButton
            variant={currentMode === "talk-together" ? "gold" : "default"}
            onClick={() => onModeChange("talk-together")}
            className="flex-col h-28 gap-3 rounded-xl"
          >
            <Users className="h-7 w-7" />
            <span className="text-sm font-medium">Talk Together</span>
          </CyberButton>
        </div>
      </div>

      {/* Session Control */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-bridgit-secondary uppercase tracking-wider flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Session Control
        </h3>
        {currentMode === "just-me" ? (
          !sessionCode ? (
            <div className="grid grid-cols-2 gap-4">
              <CyberButton
                variant="neon"
                className="flex-col h-28 gap-3 rounded-xl"
                onClick={onHostSession}
              >
                <UserPlus className="h-7 w-7" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Host</div>
                  <div className="text-xs opacity-80">Create room</div>
                </div>
              </CyberButton>
              <CyberButton
                variant="primary"
                className="flex-col h-28 gap-3 rounded-xl"
                onClick={onJoinSession}
              >
                <Users className="h-7 w-7" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Join</div>
                  <div className="text-xs opacity-80">Enter code</div>
                </div>
              </CyberButton>
            </div>
          ) : (
            <CyberButton
              variant="ghost"
              className="w-full justify-start gap-3 border-red-500/20 text-red-400"
              onClick={onEndSession}
            >
              <X className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">End Session</div>
                <div className="text-xs opacity-80">Disconnect from room</div>
              </div>
            </CyberButton>
          )
        ) : (
          <div className="text-center p-4 text-muted-foreground text-sm bg-neubg/30 rounded-neu">
            Talk Together mode uses local translation only.
          </div>
        )}
      </div>

      {/* Token & Plan */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-bridgit-gold uppercase tracking-wider flex items-center gap-2">
          <Crown className="h-4 w-4" />
          Token & Plan
        </h3>
        <div className="space-y-4">
          <div className="neu-card-inset p-4 text-center rounded-xl">
            <div className="text-xl font-bold text-bridgit-gold">247</div>
            <div className="text-xs text-muted-foreground">
              tokens remaining
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CyberButton
              variant="gold"
              className="flex-col h-28 gap-3 rounded-xl"
              onClick={() => setActiveTab("pricing")}
            >
              <Zap className="h-7 w-7" />
              <div className="text-center">
                <div className="font-semibold text-sm">Buy Tokens</div>
                <div className="text-xs opacity-80">From $4.99</div>
              </div>
            </CyberButton>
            <CyberButton
              variant="primary"
              className="flex-col h-28 gap-3 rounded-xl"
              onClick={() => setActiveTab("pricing")}
            >
              <Crown className="h-7 w-7" />
              <div className="text-center">
                <div className="font-semibold text-sm">Upgrade</div>
                <div className="text-xs opacity-80">From $9.99/mo</div>
              </div>
            </CyberButton>
          </div>
        </div>
      </div>

      {/* Account & Quick Access */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <User className="h-4 w-4" />
          Account & Settings
        </h3>

        {/* Account Grid */}
        <div className="grid grid-cols-2 gap-4">
          <CyberButton className="flex-col h-28 gap-3 rounded-xl">
            <User className="h-7 w-7" />
            <div className="text-center">
              <div className="font-semibold text-sm">Profile</div>
              <div className="text-xs opacity-80">Manage account</div>
            </div>
          </CyberButton>
          <CyberButton className="flex-col h-28 gap-3 rounded-xl">
            <Settings className="h-7 w-7" />
            <div className="text-center">
              <div className="font-semibold text-sm">Sign In</div>
              <div className="text-xs opacity-80">Login / Register</div>
            </div>
          </CyberButton>
        </div>

        {/* Quick Settings Grid */}
        <div className="grid grid-cols-4 gap-3">
          <CyberButton
            variant="ghost"
            onClick={() => setActiveTab("voice")}
            className="flex-col h-24 gap-2 hover:bg-bridgit-primary/10 rounded-xl"
          >
            <Volume2 className="h-6 w-6 text-bridgit-primary" />
            <span className="text-xs font-medium">Voice</span>
          </CyberButton>
          <CyberButton
            variant="ghost"
            onClick={() => setActiveTab("colors")}
            className="flex-col h-24 gap-2 hover:bg-bridgit-secondary/10 rounded-xl"
          >
            <Palette className="h-6 w-6 text-bridgit-secondary" />
            <span className="text-xs font-medium">Theme</span>
          </CyberButton>
          <CyberButton
            variant="ghost"
            onClick={() => setActiveTab("pricing")}
            className="flex-col h-24 gap-2 hover:bg-bridgit-gold/10 rounded-xl"
          >
            <CreditCard className="h-6 w-6 text-bridgit-gold" />
            <span className="text-xs font-medium">Pricing</span>
          </CyberButton>
          <CyberButton
            variant="ghost"
            onClick={() => setActiveTab("settings")}
            className="flex-col h-24 gap-2 hover:bg-bridgit-accent/10 rounded-xl"
          >
            <Settings className="h-6 w-6 text-bridgit-accent" />
            <span className="text-xs font-medium">Settings</span>
          </CyberButton>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Settings</h2>
        <CyberButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </CyberButton>
      </div>

      <div className="space-y-3">
        <CyberButton variant="gold" className="w-full justify-start gap-3">
          <Crown className="h-4 w-4" />
          Clone Your Voice (Premium)
        </CyberButton>
        <CyberButton className="w-full justify-start gap-3">
          <Volume2 className="h-4 w-4" />
          Voice Library
        </CyberButton>
        <CyberButton className="w-full justify-start gap-3">
          <Settings className="h-4 w-4" />
          Account Settings
        </CyberButton>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Customize Colors</h2>
        <CyberButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </CyberButton>
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
        <CyberButton
          variant="ghost"
          size="icon"
          onClick={() => setActiveTab("main")}
        >
          <X className="h-4 w-4" />
        </CyberButton>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-bridgit-primary uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Basic Voices
        </h3>
        {["Alloy", "Echo", "Fable", "Onyx", "Nova", "Shimmer"].map((voice) => (
          <CyberButton key={voice} className="w-full justify-start">
            {voice}
          </CyberButton>
        ))}

        <h3 className="text-sm font-semibold text-bridgit-gold uppercase tracking-wider flex items-center gap-2 mt-6">
          <Crown className="h-4 w-4" />
          Premium Voices
        </h3>
        {["Rachel", "Drew", "Clyde", "Paul"].map((voice) => (
          <CyberButton
            key={voice}
            variant="gold"
            className="w-full justify-start opacity-60"
          >
            {voice} (Premium)
          </CyberButton>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-slide-up">
      <HoloCard
        variant="premium"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hidden"
        glow
        animated
      >
        {activeTab === "main" && renderMainTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "colors" && renderColorsTab()}
        {activeTab === "voice" && renderVoiceTab()}
        {activeTab === "pricing" && (
          <PricingMenu
            currentPlan="basic" // TODO: Get from user data
            tokenBalance={247} // TODO: Get from user data
            onClose={() => setActiveTab("main")}
          />
        )}

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
