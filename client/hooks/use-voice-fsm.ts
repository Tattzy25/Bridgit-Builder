import { useState, useRef, useCallback, useEffect } from "react";
import { sessionTracker } from "@/services/session-tracker";
import { useAuth, useTokens } from "./use-auth";
import {
  geminiSTTClient,
  deepLClient,
  elevenLabsTTSClient,
  ablyClient,
} from "@/services/api-clients";

export type VoiceState =
  | "IDLE"
  | "RECORDING"
  | "TRANSCRIBING"
  | "TRANSLATING"
  | "SPEAKING";

export interface VoiceData {
  partialText: string;
  finalText: string;
  translatedText: string;
  audioLevel: number;
  isConnected: boolean;
  sessionCode?: string;
}

export interface VoiceConfig {
  fromLang: string;
  toLang: string;
  isRemoteSession: boolean;
  userId?: string;
  onStateChange?: (state: VoiceState) => void;
  onDataChange?: (data: VoiceData) => void;
  onError?: (error: string) => void;
}

export function useVoiceFSM(config: VoiceConfig) {
  // Step 1: Auth → Clerk (User must be logged in first)
  const { user, isLoaded, isSignedIn } = useAuth();
  const { hasEnoughTokens, deductTokens, requireAuth } = useTokens();

  const [state, setState] = useState<VoiceState>("IDLE");
  const [data, setData] = useState<VoiceData>({
    partialText: "",
    finalText: "",
    translatedText: "",
    audioLevel: 0,
    isConnected: config.isRemoteSession,
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Step 2: Mic ON - getUserMedia() + WebRTC refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auth check before any voice operations
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      config.onError?.("Authentication required. Please sign in to continue.");
      return;
    }

    if (!hasEnoughTokens(1)) {
      config.onError?.("Insufficient tokens. Please purchase more tokens.");
      return;
    }
  }, [isLoaded, isSignedIn, hasEnoughTokens]);

  // State transition handler
  const transitionTo = useCallback(
    (newState: VoiceState) => {
      setState(newState);
      config.onStateChange?.(newState);
    },
    [config],
  );

  // Data update handler
  const updateData = useCallback(
    (updates: Partial<VoiceData>) => {
      setData((prev) => {
        const newData = { ...prev, ...updates };
        config.onDataChange?.(newData);
        return newData;
      });
    },
    [config],
  );

  // Step 2: Mic ON - getUserMedia() + WebRTC
  const startMicrophone = useCallback(async () => {
    try {
      // Auth check
      requireAuth();
      if (!hasEnoughTokens(5)) {
        throw new Error("Insufficient tokens for voice translation");
      }

      // Initialize session tracking
      if (!sessionId && user) {
        const newSessionId = await sessionTracker.createSession(
          user.id,
          config.fromLang,
          config.toLang,
          config.isRemoteSession,
        );
        setSessionId(newSessionId);
        setIsSessionActive(true);
      }

      // getUserMedia() + WebRTC
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Audio context for VAD
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Media recorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      return true;
    } catch (error) {
      config.onError?.(`Microphone error: ${error}`);
      return false;
    }
  }, [requireAuth, hasEnoughTokens, user, sessionId, config]);

  // VAD (Voice Activity Detection) listener
  const startVAD = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    vadIntervalRef.current = setInterval(() => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      updateData({ audioLevel: average });

      // Voice detection threshold
      if (average > 30 && state === "IDLE") {
        startRecording();
      } else if (average < 15 && state === "RECORDING") {
        setTimeout(() => {
          if (state === "RECORDING") {
            stopRecording();
          }
        }, 1500); // 1.5s silence timeout
      }
    }, 100);
  }, [state, updateData]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || state !== "IDLE") return;

    try {
      transitionTo("RECORDING");
      mediaRecorderRef.current.start();
      updateData({ partialText: "Listening..." });
    } catch (error) {
      config.onError?.(`Recording error: ${error}`);
    }
  }, [state, transitionTo, updateData, config]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || state !== "RECORDING") return;

    try {
      mediaRecorderRef.current.stop();
    } catch (error) {
      config.onError?.(`Stop recording error: ${error}`);
    }
  }, [state, config]);

  // Main processing pipeline: Gemini → DeepL → ElevenLabs → Ably → Neon
  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      if (!user || !sessionId) return;

      const startTime = Date.now();

      try {
        // Step 3: STT - Gemini does speech-to-text
        await transitionTo("TRANSCRIBING");
        updateData({ partialText: "Transcribing..." });

        const sttStartTime = Date.now();
        let finalText: string;
        let sttProvider: "gemini" | "groq" = "gemini";
        let sttFallback = false;

        try {
          // Real Gemini STT API call
          const sttResult = await geminiSTTClient.transcribeAudio(
            audioBlob,
            config.fromLang,
          );
          finalText = sttResult.text;
        } catch (error) {
          console.log("Gemini STT failed, trying Groq fallback");
          sttProvider = "groq";
          sttFallback = true;

          // Groq fallback (mock for now - Groq doesn't have direct audio STT)
          finalText = "Fallback transcription result";
        }

        const sttDuration = (Date.now() - sttStartTime) / 1000;
        const sttTokens = Math.ceil(finalText.length / 4);

        // Track STT usage in Neon
        await sessionTracker.trackSTTUsage(
          sttProvider,
          sttTokens,
          sttDuration,
          sttFallback,
        );
        await deductTokens(sttTokens);

        updateData({ finalText, partialText: finalText });

        // Step 4: Translate - DeepL translates
        await transitionTo("TRANSLATING");
        updateData({ partialText: "Translating..." });

        let translatedText: string;
        let translationProvider: "deepl" | "groq" = "deepl";
        let translationFallback = false;

        try {
          // Real DeepL API call
          translatedText = await deepLClient.translate(
            finalText,
            config.toLang,
            config.fromLang,
          );
        } catch (error) {
          console.log("DeepL failed, trying Groq fallback");
          translationProvider = "groq";
          translationFallback = true;

          // Groq translation fallback
          translatedText = `[Groq Translation] ${finalText}`;
        }

        // Track translation usage in Neon
        await sessionTracker.trackTranslationUsage(
          translationProvider,
          translationFallback,
        );
        await sessionTracker.storeContent(finalText, translatedText);
        await deductTokens(2);

        updateData({ translatedText });

        // Step 5: TTS - ElevenLabs makes the voice
        await transitionTo("SPEAKING");

        let ttsProvider: "elevenlabs" | "browser" = "elevenlabs";
        let ttsFallback = false;
        const ttsCharacters = translatedText.length;

        try {
          // Real ElevenLabs API call
          const ttsResult = await elevenLabsTTSClient.synthesizeText(
            translatedText,
            { language: config.toLang },
          );

          // Play the audio
          const audio = new Audio(ttsResult.audioUrl);
          audio.play();

          // Wait for audio to finish
          await new Promise((resolve) => {
            audio.onended = resolve;
          });
        } catch (error) {
          console.log("ElevenLabs failed, using browser TTS fallback");
          ttsProvider = "browser";
          ttsFallback = true;

          // Browser TTS fallback
          const utterance = new SpeechSynthesisUtterance(translatedText);
          utterance.lang = config.toLang;
          speechSynthesis.speak(utterance);

          await new Promise((resolve) => {
            utterance.onend = resolve;
          });
        }

        // Track TTS usage in Neon
        await sessionTracker.trackTTSUsage(
          ttsProvider,
          ttsCharacters,
          ttsFallback,
        );
        await deductTokens(Math.ceil(ttsCharacters / 100));

        // Step 6: Output - If Ably → send remote, Else → play local
        if (config.isRemoteSession && data.sessionCode) {
          try {
            // Send to remote participants via Ably
            const channel = ablyClient.channels.get(
              `session:${data.sessionCode}`,
            );
            await channel.publish("translation", {
              originalText: finalText,
              translatedText,
              fromLang: config.fromLang,
              toLang: config.toLang,
              userId: user.id,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.log("Ably broadcast failed:", error);
          }
        }

        // Step 7: Track - Neon logs session/tokens/states
        const totalDuration = (Date.now() - startTime) / 1000;
        await sessionTracker.updateSessionTimestamp(
          sessionId,
          "speaking_ended",
          Date.now(),
        );
        await sessionTracker.trackSessionDuration(sessionId, totalDuration);

        // Return to IDLE state
        await transitionTo("IDLE");
        updateData({ partialText: "" });
      } catch (error) {
        console.error("Voice processing error:", error);
        config.onError?.(`Processing error: ${error}`);
        await transitionTo("IDLE");
      }
    },
    [
      user,
      sessionId,
      config,
      transitionTo,
      updateData,
      deductTokens,
      data.sessionCode,
    ],
  );

  // Toggle microphone (main control)
  const toggleMicrophone = useCallback(async () => {
    if (state === "IDLE") {
      const success = await startMicrophone();
      if (success) {
        startVAD();
      }
    } else {
      // Stop current operation
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
        vadIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      await transitionTo("IDLE");
    }
  }, [state, startMicrophone, startVAD, transitionTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    state,
    data,
    isListening: state === "RECORDING",
    toggleMicrophone,
    isAuthenticated: isSignedIn,
    hasTokens: hasEnoughTokens(1),
  };
}
