import { ablyClient } from "./api-clients";
import { Types } from "ably";

export interface SessionCode {
  code: string;
  channelName: string;
  hostUserId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface SessionParticipant {
  userId: string;
  clientId: string;
  isHost: boolean;
  joinedAt: Date;
}

export interface VoiceMessage {
  type: "voice_start" | "voice_data" | "voice_end" | "translation" | "error";
  userId: string;
  data?: any;
  timestamp: Date;
}

export class AblySessionManager {
  private channel: Types.RealtimeChannelPromise | null = null;
  private currentSessionCode: string | null = null;
  private isHost = false;
  private participants: Map<string, SessionParticipant> = new Map();
  private sessionTimeout: NodeJS.Timeout | null = null;

  // Generate 6-digit session code
  generateSessionCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Host a new session
  async hostSession(userId: string): Promise<SessionCode> {
    try {
      const code = this.generateSessionCode();
      const channelName = `bridgit_${code}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      // Create session in database
      const sessionData = {
        session_id: crypto.randomUUID(),
        user_id: userId,
        session_code: code,
        channel_name: channelName,
        host_user_id: userId,
        status: "active",
        expires_at: expiresAt.toISOString(),
      };

      // TODO: Store in database
      await this.storeSessionCode(sessionData);

      // Connect to Ably channel
      this.channel = ablyClient.channels.get(channelName);
      this.currentSessionCode = code;
      this.isHost = true;

      // Set up channel listeners
      await this.setupChannelListeners();

      // Add host as participant
      this.participants.set(userId, {
        userId,
        clientId: ablyClient.auth.clientId || userId,
        isHost: true,
        joinedAt: now,
      });

      // Set auto-expiry
      this.setSessionTimeout(60 * 60 * 1000); // 1 hour

      console.log(`✅ Session hosted: ${code}`);

      return {
        code,
        channelName,
        hostUserId: userId,
        createdAt: now,
        expiresAt,
      };
    } catch (error) {
      console.error("❌ Failed to host session:", error);
      throw error;
    }
  }

  // Join an existing session
  async joinSession(code: string, userId: string): Promise<boolean> {
    try {
      // Validate session code
      const sessionData = await this.validateSessionCode(code);
      if (!sessionData) {
        throw new Error("Invalid or expired session code");
      }

      const channelName = `bridgit_${code}`;

      // Connect to Ably channel
      this.channel = ablyClient.channels.get(channelName);
      this.currentSessionCode = code;
      this.isHost = false;

      // Set up channel listeners
      await this.setupChannelListeners();

      // Add as participant
      this.participants.set(userId, {
        userId,
        clientId: ablyClient.auth.clientId || userId,
        isHost: false,
        joinedAt: new Date(),
      });

      // Announce join
      await this.publishMessage({
        type: "voice_start",
        userId,
        data: { action: "joined" },
        timestamp: new Date(),
      });

      console.log(`✅ Joined session: ${code}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to join session:", error);
      throw error;
    }
  }

  // Set up channel event listeners
  private async setupChannelListeners() {
    if (!this.channel) return;

    // Listen for voice messages
    this.channel.subscribe("voice", (message) => {
      this.handleVoiceMessage(message.data as VoiceMessage);
    });

    // Listen for participant changes
    this.channel.subscribe("participant", (message) => {
      this.handleParticipantChange(message.data);
    });

    // Listen for session control
    this.channel.subscribe("control", (message) => {
      this.handleControlMessage(message.data);
    });

    // Handle presence
    await this.channel.presence.enter({
      userId: ablyClient.auth.clientId,
      isHost: this.isHost,
    });

    this.channel.presence.subscribe((message) => {
      this.handlePresenceChange(message);
    });
  }

  // Publish voice message to channel
  async publishVoiceMessage(message: VoiceMessage): Promise<void> {
    if (!this.channel) {
      throw new Error("No active session");
    }

    await this.channel.publish("voice", message);
  }

  // Publish control message
  async publishControlMessage(data: any): Promise<void> {
    if (!this.channel) {
      throw new Error("No active session");
    }

    await this.channel.publish("control", data);
  }

  // End session (host only)
  async endSession(): Promise<void> {
    if (!this.isHost) {
      throw new Error("Only host can end session");
    }

    try {
      // Notify all participants
      await this.publishControlMessage({
        action: "session_ended",
        timestamp: new Date(),
      });

      // Cleanup
      await this.cleanup();

      // Mark session as closed in database
      if (this.currentSessionCode) {
        await this.closeSessionInDB(this.currentSessionCode);
      }

      console.log("✅ Session ended");
    } catch (error) {
      console.error("❌ Failed to end session:", error);
      throw error;
    }
  }

  // Leave session (participant)
  async leaveSession(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.presence.leave();
      }

      await this.cleanup();
      console.log("✅ Left session");
    } catch (error) {
      console.error("❌ Failed to leave session:", error);
      throw error;
    }
  }

  // Handle incoming voice messages
  private handleVoiceMessage(message: VoiceMessage) {
    console.log("🎤 Voice message received:", message);

    // Emit to FSM or voice handler
    window.dispatchEvent(
      new CustomEvent("ably-voice-message", { detail: message }),
    );
  }

  // Handle participant changes
  private handleParticipantChange(data: any) {
    console.log("👥 Participant change:", data);

    // Update participants list
    if (data.action === "joined") {
      this.participants.set(data.userId, {
        userId: data.userId,
        clientId: data.clientId,
        isHost: false,
        joinedAt: new Date(data.timestamp),
      });
    } else if (data.action === "left") {
      this.participants.delete(data.userId);
    }

    // Emit participant change event
    window.dispatchEvent(
      new CustomEvent("ably-participant-change", { detail: data }),
    );
  }

  // Handle control messages
  private handleControlMessage(data: any) {
    console.log("🎛️ Control message:", data);

    if (data.action === "session_ended") {
      this.cleanup();
    }

    // Emit control event
    window.dispatchEvent(
      new CustomEvent("ably-control-message", { detail: data }),
    );
  }

  // Handle presence changes
  private handlePresenceChange(message: Types.PresenceMessage) {
    console.log("👁️ Presence change:", message);

    const userData = message.data;

    if (message.action === "enter") {
      this.participants.set(userData.userId, {
        userId: userData.userId,
        clientId: message.clientId,
        isHost: userData.isHost,
        joinedAt: new Date(),
      });
    } else if (message.action === "leave") {
      this.participants.delete(userData.userId);
    }
  }

  // Set session timeout
  private setSessionTimeout(duration: number) {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      console.log("⏰ Session expired");
      this.endSession().catch(console.error);
    }, duration);
  }

  // Cleanup resources
  private async cleanup() {
    if (this.channel) {
      await this.channel.detach();
      this.channel = null;
    }

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    this.currentSessionCode = null;
    this.isHost = false;
    this.participants.clear();
  }

  // Publish message helper
  private async publishMessage(message: VoiceMessage) {
    await this.publishVoiceMessage(message);
  }

  // Database operations (mocked for now)
  private async storeSessionCode(sessionData: any): Promise<void> {
    // TODO: Store in bridgit_sessions table
    console.log("📝 Storing session code:", sessionData);
  }

  private async validateSessionCode(code: string): Promise<any> {
    // TODO: Check bridgit_sessions table
    console.log("🔍 Validating session code:", code);
    // For now, always return valid (implement actual validation)
    return { valid: true, expires_at: new Date(Date.now() + 3600000) };
  }

  private async closeSessionInDB(code: string): Promise<void> {
    // TODO: Update bridgit_sessions status to 'closed'
    console.log("🔒 Closing session in DB:", code);
  }

  // Getters
  get sessionCode(): string | null {
    return this.currentSessionCode;
  }

  get isSessionHost(): boolean {
    return this.isHost;
  }

  get isConnected(): boolean {
    return this.channel !== null;
  }

  get participantCount(): number {
    return this.participants.size;
  }

  get participantList(): SessionParticipant[] {
    return Array.from(this.participants.values());
  }
}

// Singleton instance
export const ablySessionManager = new AblySessionManager();
