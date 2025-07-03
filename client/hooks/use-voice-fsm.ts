import { useState, useRef, useCallback, useEffect } from "react";
import { sessionTracker } from "@/services/session-tracker";
import { useAuth } from "./use-auth";

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
  userId?: string; // Will be populated from auth
  onStateChange?: (state: VoiceState) => void;
  onDataChange?: (data: VoiceData) => void;
  onError?: (error: string) => void;
}

export function useVoiceFSM(config: VoiceConfig) {
  const { user, isLoaded, isSignedIn } = useAuth();
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef(false);

  // VAD (Voice Activity Detection) parameters
  const VAD_THRESHOLD = 0.01; // Adjust based on testing
  const SILENCE_DURATION = 1500; // 1.5 seconds of silence to stop recording
  const MIN_RECORDING_DURATION = 500; // Minimum recording duration

  const silenceStartRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  // State transition with database tracking
  const transitionTo = useCallback(
    async (newState: VoiceState) => {
      console.log(`FSM: ${state} → ${newState}`);
      setState(newState);
      config.onStateChange?.(newState);

      // Track state change in database
      if (isSessionActive) {
        try {
          await sessionTracker.updateFSMState(newState);
        } catch (error) {
          console.error("Failed to track FSM state:", error);
        }
      }
    },
    [state, config, isSessionActive],
  );

  // Update data with callbacks
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

  // VAD Loop - monitors audio levels continuously
  const startVAD = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      if (!isListeningRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS (Root Mean Square) for audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength) / 255;

      updateData({ audioLevel: rms });

      const now = Date.now();

      // Voice Activity Detection
      if (rms > VAD_THRESHOLD) {
        // Voice detected
        silenceStartRef.current = null;

        if (state === "IDLE" && isListeningRef.current) {
          recordingStartRef.current = now;
          transitionTo("RECORDING");
          startRecording();
        }
      } else {
        // Silence detected
        if (state === "RECORDING") {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = now;
          } else if (now - silenceStartRef.current > SILENCE_DURATION) {
            // Check minimum recording duration
            if (
              recordingStartRef.current &&
              now - recordingStartRef.current > MIN_RECORDING_DURATION
            ) {
              stopRecording();
            }
          }
        }
      }
    };

    vadIntervalRef.current = setInterval(checkAudioLevel, 100); // Check every 100ms
  }, [state, transitionTo, updateData]);

  // Initialize microphone and start VAD
  const initializeMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup Web Audio API for VAD
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Setup MediaRecorder for recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      return true;
    } catch (error) {
      config.onError?.(`Microphone access denied: ${error}`);
      return false;
    }
  }, [config]);

  // Start recording audio
  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    const chunks: Blob[] = [];
    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      processAudio(audioBlob);
    };

    mediaRecorder.start();
  }, []);

  // Stop recording and process audio
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      transitionTo("TRANSCRIBING");
    }
  }, [transitionTo]);

  // Process recorded audio through STT → Translation → TTS pipeline
  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      const startTime = Date.now();

      try {
        // Step 1: Speech to Text (STT)
        await transitionTo("TRANSCRIBING");
        updateData({ partialText: "Processing audio..." });

        const sttStartTime = Date.now();
        let sttResult;
        let sttProvider: "gemini" | "groq" = "gemini";
        let sttFallback = false;

        try {
          // TODO: Replace with actual Gemini STT API call
          sttResult = await mockSTT(audioBlob, config.fromLang);
        } catch (error) {
          console.log("Gemini STT failed, trying Groq fallback");
          sttProvider = "groq";
          sttFallback = true;
          sttResult = await mockSTTFallback(audioBlob, config.fromLang);
        }

        const sttDuration = (Date.now() - sttStartTime) / 1000;
        const sttTokens = Math.ceil(sttResult.finalText.length / 4); // Rough token estimate

        // Track STT usage
        await sessionTracker.trackSTTUsage(
          sttProvider,
          sttTokens,
          sttDuration,
          sttFallback,
        );

        updateData({
          finalText: sttResult.finalText,
          partialText: sttResult.finalText,
        });

        // Step 2: Translation
        await transitionTo("TRANSLATING");

        let translatedText;
        let translationProvider: "deepl" | "groq" = "deepl";
        let translationFallback = false;

        try {
          // TODO: Replace with actual DeepL API call
          translatedText = await mockTranslate(
            sttResult.finalText,
            config.fromLang,
            config.toLang,
          );
        } catch (error) {
          console.log("DeepL failed, trying Groq fallback");
          translationProvider = "groq";
          translationFallback = true;
          translatedText = await mockTranslateFallback(
            sttResult.finalText,
            config.fromLang,
            config.toLang,
          );
        }

        // Track translation usage
        await sessionTracker.trackTranslationUsage(
          translationProvider,
          translationFallback,
        );

        // Store content in database
        await sessionTracker.storeContent(sttResult.finalText, translatedText);

        updateData({ translatedText });

        // Step 3: Text to Speech (TTS) and Playback
        await transitionTo("SPEAKING");

        const ttsCharacters = translatedText.length;
        let ttsProvider: "elevenlabs" | "browser" = "elevenlabs";
        let ttsVoice = "default";
        let ttsFallback = false;

        try {
          if (config.isRemoteSession) {
            // TODO: Publish to Ably for remote users
            await publishToAbly({
              state: "SPEAKING",
              translatedText,
              fromUser: user?.id,
              sessionCode: data.sessionCode,
            });
          } else {
            // TODO: Replace with ElevenLabs TTS
            try {
              await playTTS(translatedText, config.toLang);
            } catch (error) {
              console.log("ElevenLabs failed, using browser fallback");
              ttsProvider = "browser";
              ttsFallback = true;
              await playTTSFallback(translatedText, config.toLang);
            }
          }
        } catch (error) {
          ttsProvider = "browser";
          ttsFallback = true;
          await playTTSFallback(translatedText, config.toLang);
        }

        // Track TTS usage
        await sessionTracker.trackTTSUsage(
          ttsProvider,
          ttsVoice,
          ttsCharacters,
          ttsFallback,
        );

        // Return to IDLE
        setTimeout(async () => {
          await transitionTo("IDLE");
          updateData({
            partialText: "",
            finalText: "",
            translatedText: "",
          });
        }, 1000);
      } catch (error) {
        config.onError?.(`Processing error: ${error}`);

        // Track error in session
        if (isSessionActive) {
          await sessionTracker.errorSession(`Processing error: ${error}`);
          setIsSessionActive(false);
          setSessionId(null);
        }

        await transitionTo("IDLE");
      }
    },
    [config, data.sessionCode, transitionTo, updateData, user, isSessionActive],
  );

  // Create new session when starting
  const createSession = useCallback(async () => {
    if (!user?.id) {
      config.onError?.("User not authenticated");
      return null;
    }

    try {
      const newSessionId = await sessionTracker.createSession({
        userId: user.id,
        planId: user.planId,
        sourceLanguage: config.fromLang,
        targetLanguage: config.toLang,
      });

      setSessionId(newSessionId);
      setIsSessionActive(true);
      return newSessionId;
    } catch (error) {
      config.onError?.(`Failed to create session: ${error}`);
      return null;
    }
  }, [user, config]);

  // Start/Stop microphone listening
  const toggleMicrophone = useCallback(async () => {
    if (!isListeningRef.current) {
      // Check authentication
      if (!isLoaded) {
        config.onError?.("Authentication loading...");
        return;
      }

      if (!isSignedIn || !user) {
        config.onError?.("Please sign in to use voice translation");
        return;
      }

      // Create new session
      const newSessionId = await createSession();
      if (!newSessionId) return;

      // Start listening
      const success = await initializeMicrophone();
      if (success) {
        isListeningRef.current = true;
        startVAD();
        updateData({ isConnected: true });
      } else {
        // Cleanup session if mic failed
        await sessionTracker.errorSession("Microphone access denied");
        setIsSessionActive(false);
        setSessionId(null);
      }
    } else {
      // Stop listening
      isListeningRef.current = false;

      if (vadIntervalRef.current) {
        clearInterval(vadIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      transitionTo("IDLE");
      updateData({ isConnected: false, audioLevel: 0 });

      // Complete session
      if (isSessionActive) {
        await sessionTracker.completeSession();
        setIsSessionActive(false);
        setSessionId(null);
      }
    }
  }, [
    initializeMicrophone,
    startVAD,
    transitionTo,
    updateData,
    createSession,
    isLoaded,
    isSignedIn,
    user,
    isSessionActive,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) audioContextRef.current.close();

      // End session if active
      if (isSessionActive) {
        sessionTracker.endSession();
      }
    };
  }, [isSessionActive]);

  return {
    state,
    data,
    isListening: isListeningRef.current,
    toggleMicrophone,
    sessionId,
    isSessionActive,
    user,
    isAuthenticated: isSignedIn && !!user,
  };
}

// Mock API functions - TODO: Replace with real implementations
async function mockSTT(audioBlob: Blob, language: string) {
  // Simulate STT processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    finalText: `Hello, this is a test message in ${language}`,
    confidence: 0.95,
  };
}

async function mockSTTFallback(audioBlob: Blob, language: string) {
  // Simulate Groq STT fallback
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    finalText: `[Groq STT] Hello, this is a test message in ${language}`,
    confidence: 0.85,
  };
}

async function mockTranslate(text: string, fromLang: string, toLang: string) {
  // Simulate translation time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const translations: Record<string, string> = {
    "EN→FR": "Bonjour, ceci est un message de test en français",
    "FR→EN": "Hello, this is a test message in English",
    "EN→ES": "Hola, este es un mensaje de prueba en español",
    "ES→EN": "Hello, this is a test message in English",
  };

  return translations[`${fromLang}→${toLang}`] || `Translated: ${text}`;
}

async function mockTranslateFallback(
  text: string,
  fromLang: string,
  toLang: string,
) {
  // Simulate Groq translation fallback
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return `[Groq Translation] ${text} (translated from ${fromLang} to ${toLang})`;
}

async function playTTS(text: string, language: string) {
  // TODO: Replace with ElevenLabs TTS API
  // Simulate ElevenLabs API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  // For now, use browser fallback
  return playTTSFallback(text, language);
}

async function playTTSFallback(text: string, language: string) {
  // Browser SpeechSynthesis fallback
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "EN"
        ? "en-US"
        : language === "FR"
          ? "fr-FR"
          : language === "ES"
            ? "es-ES"
            : "en-US";

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }
}

async function publishToAbly(data: any) {
  // TODO: Implement Ably publishing
  console.log("Publishing to Ably:", data);
  await new Promise((resolve) => setTimeout(resolve, 500));
}
