// API Client Services for Bridgit AI
import Ably from "ably";
import Spaces from "@ably/spaces";
import { Chat } from "@ably/chat";
import { ElevenLabsApi } from "@elevenlabs/elevenlabs-js";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";

// Environment variables validation
const requiredEnvVars = {
  VITE_ABLY_API_KEY: import.meta.env.VITE_ABLY_API_KEY,
  VITE_ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY,
  VITE_GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  VITE_DEEPL_API_KEY: import.meta.env.VITE_DEEPL_API_KEY,
};

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
  }
});

// Ably Real-time SDK for communication
export const ablyClient = new Ably.Realtime({
  key: import.meta.env.VITE_ABLY_API_KEY || "",
  clientId: "bridgit-ai-client",
});

// Ably Spaces SDK for collaboration features
export const ablySpaces = new Spaces(ablyClient);

// Ably Chat SDK for messaging
export const ablyChat = new Chat(ablyClient);

// ElevenLabs TTS SDK
export const elevenLabsClient = new ElevenLabsApi({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || "",
});

// Groq SDK for fast inference
export const groqClient = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true, // Only for client-side usage
});

// Google Gemini SDK
export const geminiClient = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY || "",
);

// DeepL Translation Service
export class DeepLClient {
  private apiKey: string;
  private baseUrl = "https://api-free.deepl.com/v2";

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPL_API_KEY || "";
  }

  async translate(
    text: string,
    targetLang: string,
    sourceLang?: string,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text,
          target_lang: targetLang.toUpperCase(),
          ...(sourceLang && { source_lang: sourceLang.toUpperCase() }),
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.translations[0]?.text || text;
    } catch (error) {
      console.error("DeepL translation error:", error);
      throw error;
    }
  }

  async getUsage(): Promise<{
    character_count: number;
    character_limit: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/usage`, {
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`DeepL usage API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("DeepL usage check error:", error);
      throw error;
    }
  }
}

export const deepLClient = new DeepLClient();

// Neon Database client (for server-side usage)
export const createNeonClient = () => {
  const connectionString = import.meta.env.DATABASE_URL || "";
  if (!connectionString) {
    throw new Error("DATABASE_URL not configured");
  }
  return neon(connectionString);
};

// Voice ID mappings for ElevenLabs
export const VOICE_IDS = {
  DEFAULT: import.meta.env.VITE_ELEVENLABS_VOICE_ID || "",
  FEMALE: import.meta.env.VITE_ELEVENLABS_FEMALE_VOICE || "",
  MALE: import.meta.env.VITE_ELEVENLABS_MALE_VOICE || "",
};

// Language mappings for APIs
export const LANGUAGE_MAPPINGS = {
  // ISO 639-1 to service-specific codes
  DEEPL: {
    EN: "EN-US",
    FR: "FR",
    ES: "ES",
    DE: "DE",
    IT: "IT",
    PT: "PT-PT",
    ZH: "ZH-CN",
    JA: "JA",
    KO: "KO",
    AR: "AR",
  },
  GEMINI: {
    EN: "en",
    FR: "fr",
    ES: "es",
    DE: "de",
    IT: "it",
    PT: "pt",
    ZH: "zh-cn",
    JA: "ja",
    KO: "ko",
    AR: "ar",
  },
  ELEVENLABS: {
    EN: "en",
    FR: "fr",
    ES: "es",
    DE: "de",
    IT: "it",
    PT: "pt",
    ZH: "zh",
    JA: "ja",
    KO: "ko",
    AR: "ar",
  },
};

// Connection status helpers
export const checkConnectionStatus = async () => {
  const status = {
    ably: false,
    elevenLabs: false,
    groq: false,
    gemini: false,
    deepL: false,
  };

  try {
    // Check Ably connection
    status.ably = ablyClient.connection.state === "connected";

    // Check ElevenLabs (simple API call)
    try {
      await elevenLabsClient.voices.getAll();
      status.elevenLabs = true;
    } catch (error) {
      console.warn("ElevenLabs connection failed:", error);
    }

    // Check Groq (simple model list)
    try {
      await groqClient.models.list();
      status.groq = true;
    } catch (error) {
      console.warn("Groq connection failed:", error);
    }

    // Check Gemini (simple model info)
    try {
      const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });
      status.gemini = !!model;
    } catch (error) {
      console.warn("Gemini connection failed:", error);
    }

    // Check DeepL (usage endpoint)
    try {
      await deepLClient.getUsage();
      status.deepL = true;
    } catch (error) {
      console.warn("DeepL connection failed:", error);
    }
  } catch (error) {
    console.error("Connection status check failed:", error);
  }

  return status;
};

// Export all clients for easy access
export const apiClients = {
  ably: ablyClient,
  spaces: ablySpaces,
  chat: ablyChat,
  elevenLabs: elevenLabsClient,
  groq: groqClient,
  gemini: geminiClient,
  deepL: deepLClient,
};
