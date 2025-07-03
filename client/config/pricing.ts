export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  paypalPlanId?: string; // PayPal subscription plan ID
  features: string[];
  limits: {
    translations: number | "unlimited";
    sessionDuration: number | "unlimited"; // in minutes
    languages: number;
    voiceCloning: number;
    remoteSessions: boolean;
    apiAccess: boolean;
    priority: boolean;
    recording: boolean;
    analytics: boolean;
    whiteLabel: boolean;
    teamManagement: boolean;
    support: "community" | "email" | "priority" | "dedicated";
  };
  badge?: string;
  popular?: boolean;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  paypalProductId?: string;
  bonus?: number; // extra tokens
  savings?: string; // percentage saved
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Translator",
    price: 0,
    currency: "USD",
    interval: "month",
    badge: "Free Forever",
    features: [
      'Local "Talk Together" mode',
      "Basic browser voices",
      "5 supported languages",
      "Community support",
    ],
    limits: {
      translations: 50,
      sessionDuration: 0, // No remote sessions
      languages: 5,
      voiceCloning: 0,
      remoteSessions: false,
      apiAccess: false,
      priority: false,
      recording: false,
      analytics: false,
      whiteLabel: false,
      teamManagement: false,
      support: "community",
    },
  },
  {
    id: "basic",
    name: "Communicator",
    price: 9.99,
    currency: "USD",
    interval: "month",
    paypalPlanId: "BASIC_PLAN_ID", // TODO: Replace with actual PayPal plan ID
    popular: true,
    badge: "Most Popular",
    features: [
      'Remote "Just Me" sessions',
      "ElevenLabs premium voices",
      "25+ languages",
      "30-min session duration",
      "Basic voice cloning (1 voice)",
      "Email support",
    ],
    limits: {
      translations: 500,
      sessionDuration: 30,
      languages: 25,
      voiceCloning: 1,
      remoteSessions: true,
      apiAccess: false,
      priority: false,
      recording: false,
      analytics: false,
      whiteLabel: false,
      teamManagement: false,
      support: "email",
    },
  },
  {
    id: "pro",
    name: "Interpreter",
    price: 29.99,
    currency: "USD",
    interval: "month",
    paypalPlanId: "PRO_PLAN_ID", // TODO: Replace with actual PayPal plan ID
    badge: "Best Value",
    features: [
      "Unlimited session duration",
      "100+ languages",
      "Advanced voice cloning (5 voices)",
      "Priority processing",
      "Session recording & transcripts",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
    limits: {
      translations: 2000,
      sessionDuration: "unlimited",
      languages: 100,
      voiceCloning: 5,
      remoteSession: true,
      apiAccess: true,
      priority: true,
      recording: true,
      analytics: true,
      whiteLabel: false,
      teamManagement: false,
      support: "priority",
    },
  },
  {
    id: "enterprise",
    name: "Bridge Builder",
    price: 99.99,
    currency: "USD",
    interval: "month",
    paypalPlanId: "ENTERPRISE_PLAN_ID", // TODO: Replace with actual PayPal plan ID
    badge: "Enterprise",
    features: [
      "Unlimited translations",
      "White-label options",
      "Team management",
      "Advanced analytics",
      "Custom voice training",
      "Dedicated support",
      "SLA guarantees",
      "Custom integrations",
    ],
    limits: {
      translations: "unlimited",
      sessionDuration: "unlimited",
      languages: "unlimited",
      voiceCloning: "unlimited",
      remoteSeions: true,
      apiAccess: true,
      priority: true,
      recording: true,
      analytics: true,
      whiteLabel: true,
      teamManagement: true,
      support: "dedicated",
    },
  },
];

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "tokens_100",
    name: "Starter Pack",
    tokens: 100,
    price: 4.99,
    currency: "USD",
    paypalProductId: "TOKENS_100_ID",
  },
  {
    id: "tokens_250",
    name: "Basic Pack",
    tokens: 250,
    price: 9.99,
    currency: "USD",
    paypalProductId: "TOKENS_250_ID",
    bonus: 25,
    savings: "10%",
  },
  {
    id: "tokens_600",
    name: "Power Pack",
    tokens: 600,
    price: 19.99,
    currency: "USD",
    paypalProductId: "TOKENS_600_ID",
    bonus: 100,
    savings: "25%",
  },
  {
    id: "tokens_1500",
    name: "Pro Pack",
    tokens: 1500,
    price: 39.99,
    currency: "USD",
    paypalProductId: "TOKENS_1500_ID",
    bonus: 300,
    savings: "35%",
  },
];

// Token usage costs
export const TOKEN_USAGE = {
  STT_PROCESSING: 1, // 1 token per ~30 seconds
  TRANSLATION: 0.5, // 0.5 token per translation
  TTS_GENERATION: 1, // 1 token per TTS generation
  VOICE_CLONING: 10, // 10 tokens to clone a voice
};

// Current user plan helpers
export const getCurrentPlan = (planId: string): PricingPlan | null => {
  return PRICING_PLANS.find((plan) => plan.id === planId) || null;
};

export const getNextPlan = (currentPlanId: string): PricingPlan | null => {
  const currentIndex = PRICING_PLANS.findIndex(
    (plan) => plan.id === currentPlanId,
  );
  if (currentIndex === -1 || currentIndex >= PRICING_PLANS.length - 1) {
    return null;
  }
  return PRICING_PLANS[currentIndex + 1];
};

export const canUpgrade = (currentPlanId: string): boolean => {
  return getNextPlan(currentPlanId) !== null;
};
