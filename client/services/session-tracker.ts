import { VoiceState } from "@/hooks/use-voice-fsm";

export interface SessionData {
  session_id: string;
  user_id: string;
  plan_id?: string;
  source_language: string;
  target_language: string;
  created_at: string;

  // FSM State Timestamps
  recording_start?: string;
  recording_end?: string;
  transcription_start?: string;
  transcription_end?: string;
  translation_start?: string;
  translation_end?: string;
  speaking_start?: string;
  speaking_end?: string;

  // Content
  final_text?: string;
  translated_text?: string;

  // API Providers
  stt_provider?: "gemini" | "groq";
  translation_provider?: "deepl" | "groq";
  tts_provider?: "elevenlabs" | "browser";
  tts_voice?: string;

  // Usage Tracking
  stt_tokens_used?: number;
  stt_duration_seconds?: number;
  tts_characters_used?: number;
  total_tokens_billed?: number;
  usage_billed?: boolean;

  // Fallback Tracking
  stt_fallback_used?: boolean;
  translate_fallback_used?: boolean;
  tts_fallback_used?: boolean;

  // Meta
  client_ip?: string;
  user_agent?: string;
  status: "active" | "complete" | "error";
  error_message?: string;
}

export class SessionTracker {
  private currentSession: SessionData | null = null;
  private apiBase = "/api/sessions"; // TODO: Update with your API endpoint

  constructor() {
    // Get client metadata
    this.clientIP = this.getClientIP();
    this.userAgent = navigator.userAgent;
  }

  private clientIP: string | null = null;
  private userAgent: string;

  // Generate UUID for session
  private generateSessionId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  // Get client IP (in production, this would come from server)
  private getClientIP(): string {
    // TODO: Get from server endpoint that returns client IP
    return "unknown";
  }

  // Create new session - RULE: ONE row per session
  async createSession(config: {
    userId: string;
    planId?: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<string> {
    const sessionId = this.generateSessionId();

    const sessionData: SessionData = {
      session_id: sessionId,
      user_id: config.userId,
      plan_id: config.planId,
      source_language: config.sourceLanguage,
      target_language: config.targetLanguage,
      created_at: new Date().toISOString(),
      client_ip: this.clientIP || "unknown",
      user_agent: this.userAgent,
      status: "active",
    };

    try {
      // Create session in database
      const response = await fetch(`${this.apiBase}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      this.currentSession = sessionData;
      console.log(`✅ Session created: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error("❌ Failed to create session:", error);
      throw error;
    }
  }

  // Update FSM state - RULE: Always update the SAME session
  async updateFSMState(
    state: VoiceState,
    data?: Partial<SessionData>,
  ): Promise<void> {
    if (!this.currentSession) {
      console.error("❌ No active session to update");
      return;
    }

    const now = new Date().toISOString();
    const updates: Partial<SessionData> = { ...data };

    // Map FSM states to database fields
    switch (state) {
      case "RECORDING":
        if (!this.currentSession.recording_start) {
          updates.recording_start = now;
        }
        break;

      case "TRANSCRIBING":
        updates.recording_end = now;
        updates.transcription_start = now;
        break;

      case "TRANSLATING":
        updates.transcription_end = now;
        updates.translation_start = now;
        break;

      case "SPEAKING":
        updates.translation_end = now;
        updates.speaking_start = now;
        break;

      case "IDLE":
        if (
          this.currentSession.speaking_start &&
          !this.currentSession.speaking_end
        ) {
          updates.speaking_end = now;
        }
        break;
    }

    try {
      const response = await fetch(
        `${this.apiBase}/${this.currentSession.session_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.statusText}`);
      }

      // Update local session data
      Object.assign(this.currentSession, updates);
      console.log(`✅ Session updated: ${state}`, updates);
    } catch (error) {
      console.error("❌ Failed to update session:", error);
    }
  }

  // Track STT usage
  async trackSTTUsage(
    provider: "gemini" | "groq",
    tokens: number,
    duration: number,
    fallback = false,
  ): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      stt_provider: provider,
      stt_tokens_used: tokens,
      stt_duration_seconds: duration,
      stt_fallback_used: fallback,
    };

    await this.updateFSMState("TRANSCRIBING", updates);
  }

  // Track translation usage
  async trackTranslationUsage(
    provider: "deepl" | "groq",
    fallback = false,
  ): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      translation_provider: provider,
      translate_fallback_used: fallback,
    };

    await this.updateFSMState("TRANSLATING", updates);
  }

  // Track TTS usage
  async trackTTSUsage(
    provider: "elevenlabs" | "browser",
    voice: string,
    characters: number,
    fallback = false,
  ): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      tts_provider: provider,
      tts_voice: voice,
      tts_characters_used: characters,
      tts_fallback_used: fallback,
    };

    await this.updateFSMState("SPEAKING", updates);
  }

  // Store final content
  async storeContent(finalText: string, translatedText: string): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      final_text: finalText,
      translated_text: translatedText,
    };

    await this.updateFSMState("TRANSLATING", updates);
  }

  // Complete session with billing
  async completeSession(totalTokens?: number): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      status: "complete",
      total_tokens_billed: totalTokens,
      usage_billed: totalTokens ? true : false,
    };

    try {
      const response = await fetch(
        `${this.apiBase}/${this.currentSession.session_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to complete session: ${response.statusText}`);
      }

      console.log(`✅ Session completed: ${this.currentSession.session_id}`);
      this.currentSession = null;
    } catch (error) {
      console.error("❌ Failed to complete session:", error);
    }
  }

  // Handle errors
  async errorSession(errorMessage: string): Promise<void> {
    if (!this.currentSession) return;

    const updates: Partial<SessionData> = {
      status: "error",
      error_message: errorMessage,
    };

    try {
      const response = await fetch(
        `${this.apiBase}/${this.currentSession.session_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to error session: ${response.statusText}`);
      }

      console.log(
        `❌ Session errored: ${this.currentSession.session_id}`,
        errorMessage,
      );
      this.currentSession = null;
    } catch (error) {
      console.error("❌ Failed to error session:", error);
    }
  }

  // Get current session
  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  // End session (cleanup)
  endSession(): void {
    if (this.currentSession?.status === "active") {
      this.completeSession();
    }
    this.currentSession = null;
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();
