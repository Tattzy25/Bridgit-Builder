import { cn } from "@/lib/utils";
import { CyberButton } from "./cyber-button";
import { HoloCard } from "./holo-card";
import {
  PRICING_PLANS,
  TOKEN_PACKAGES,
  PricingPlan,
  TokenPackage,
} from "@/config/pricing";
import { paypalService } from "@/services/paypal";
import { Crown, Zap, Check, X, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface PricingMenuProps {
  currentPlan?: string;
  tokenBalance?: number;
  onClose: () => void;
}

export function PricingMenu({
  currentPlan = "free",
  tokenBalance = 247,
  onClose,
}: PricingMenuProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "tokens">("plans");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  // Initialize PayPal on mount
  useEffect(() => {
    paypalService.initialize();
  }, []);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === "free" || plan.id === currentPlan) return;

    setIsProcessing(true);
    setProcessingItem(plan.id);

    try {
      const containerId = `paypal-${plan.id}`;

      // Create PayPal button container
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
        await paypalService.createSubscription(
          plan,
          "user_123",
          `#${containerId}`,
        );
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      // Show error message
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  const handleTokenPurchase = async (tokenPackage: TokenPackage) => {
    setIsProcessing(true);
    setProcessingItem(tokenPackage.id);

    try {
      const containerId = `paypal-${tokenPackage.id}`;

      // Create PayPal button container
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
        await paypalService.createTokenPayment(
          tokenPackage,
          "user_123",
          `#${containerId}`,
        );
      }
    } catch (error) {
      console.error("Token purchase failed:", error);
      // Show error message
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  const renderPlanCard = (plan: PricingPlan) => {
    const isCurrentPlan = plan.id === currentPlan;
    const isFree = plan.id === "free";

    return (
      <HoloCard
        key={plan.id}
        variant={plan.popular ? "neon" : "premium"}
        className={cn(
          "relative p-6 h-full",
          isCurrentPlan && "border-bridgit-neon border-2",
          plan.popular && "scale-105",
        )}
      >
        {/* Plan Badge */}
        {plan.badge && (
          <div
            className={cn(
              "absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold",
              plan.popular
                ? "bg-gradient-to-r from-bridgit-neon to-green-400 text-black"
                : isFree
                  ? "bg-gradient-to-r from-muted/70 to-muted/50 text-white"
                  : "bg-gradient-to-r from-bridgit-gold to-yellow-400 text-black",
            )}
          >
            {plan.badge}
          </div>
        )}

        {/* Popular indicator */}
        {plan.popular && (
          <div className="absolute -top-2 -right-2">
            <Star className="h-6 w-6 text-bridgit-neon fill-current" />
          </div>
        )}

        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            {plan.name}
          </h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-bridgit-primary">
              ${plan.price}
            </span>
            {plan.price > 0 && (
              <span className="text-muted-foreground">/{plan.interval}</span>
            )}
          </div>
          {isCurrentPlan && (
            <div className="text-sm text-bridgit-neon font-medium">
              Current Plan
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-bridgit-neon mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Limits */}
        <div className="text-xs text-muted-foreground mb-6 space-y-1">
          <div>
            Translations:{" "}
            {typeof plan.limits.translations === "number"
              ? plan.limits.translations.toLocaleString()
              : plan.limits.translations}
          </div>
          <div>Languages: {plan.limits.languages}</div>
          {plan.limits.voiceCloning > 0 && (
            <div>Voice Cloning: {plan.limits.voiceCloning} voices</div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {isFree ? (
            <CyberButton variant="ghost" className="w-full" disabled>
              Current Plan
            </CyberButton>
          ) : isCurrentPlan ? (
            <CyberButton
              variant="ghost"
              className="w-full border-bridgit-neon/20 text-bridgit-neon"
            >
              <Crown className="h-4 w-4 mr-2" />
              Active
            </CyberButton>
          ) : (
            <CyberButton
              variant={plan.popular ? "neon" : "primary"}
              className="w-full"
              onClick={() => handleSubscribe(plan)}
              disabled={isProcessing}
            >
              {processingItem === plan.id
                ? "Processing..."
                : `Upgrade to ${plan.name}`}
            </CyberButton>
          )}

          {/* PayPal Button Container */}
          <div id={`paypal-${plan.id}`} className="min-h-[50px]" />
        </div>
      </HoloCard>
    );
  };

  const renderTokenCard = (tokenPackage: TokenPackage) => {
    return (
      <HoloCard
        key={tokenPackage.id}
        variant="premium"
        className="relative p-6"
      >
        {/* Savings Badge */}
        {tokenPackage.savings && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-400 text-white px-2 py-1 rounded-full text-xs font-bold">
            Save {tokenPackage.savings}
          </div>
        )}

        {/* Package Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {tokenPackage.name}
          </h3>
          <div className="text-2xl font-bold text-bridgit-gold">
            {tokenPackage.tokens}
            {tokenPackage.bonus && (
              <span className="text-green-400">+{tokenPackage.bonus}</span>
            )}{" "}
            tokens
          </div>
          <div className="text-muted-foreground text-sm">
            ${tokenPackage.price}
          </div>
        </div>

        {/* Token Value */}
        <div className="text-center mb-4 text-xs text-muted-foreground">
          ≈ {Math.floor(tokenPackage.tokens / 2)} translations
        </div>

        {/* Purchase Button */}
        <div className="space-y-2">
          <CyberButton
            variant="gold"
            className="w-full"
            onClick={() => handleTokenPurchase(tokenPackage)}
            disabled={isProcessing}
          >
            <Zap className="h-4 w-4 mr-2" />
            {processingItem === tokenPackage.id
              ? "Processing..."
              : "Buy Tokens"}
          </CyberButton>

          {/* PayPal Button Container */}
          <div id={`paypal-${tokenPackage.id}`} className="min-h-[50px]" />
        </div>
      </HoloCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Pricing & Plans</h2>
        <CyberButton variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </CyberButton>
      </div>

      {/* Current Status */}
      <div className="neu-card-inset p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">
          Current Balance
        </div>
        <div className="text-xl font-bold text-bridgit-gold">
          {tokenBalance} tokens
        </div>
        <div className="text-xs text-muted-foreground">
          Plan:{" "}
          {PRICING_PLANS.find((p) => p.id === currentPlan)?.name || "Free"}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <CyberButton
          variant={activeTab === "plans" ? "primary" : "ghost"}
          onClick={() => setActiveTab("plans")}
          className="flex-1"
        >
          <Crown className="h-4 w-4 mr-2" />
          Subscription Plans
        </CyberButton>
        <CyberButton
          variant={activeTab === "tokens" ? "gold" : "ghost"}
          onClick={() => setActiveTab("tokens")}
          className="flex-1"
        >
          <Zap className="h-4 w-4 mr-2" />
          Buy Tokens
        </CyberButton>
      </div>

      {/* Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {activeTab === "plans" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_PLANS.map(renderPlanCard)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOKEN_PACKAGES.map(renderTokenCard)}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>💳 Secure payments powered by PayPal</div>
        <div>🔄 Cancel subscription anytime</div>
        <div>🔒 No hidden fees or commitments</div>
      </div>
    </div>
  );
}
