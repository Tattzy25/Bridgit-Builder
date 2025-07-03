import { useState, useRef, useCallback, useEffect } from "react";

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
  userId: string;
  onStateChange?: (state: VoiceState) => void;
  onDataChange?: (data: VoiceData) => void;
  onError?: (error: string) => void;
}

export function useVoiceFSM(config: VoiceConfig) {
  const [state, setState] = useState<VoiceState>("IDLE");
  const [data, setData] = useState<VoiceData>({
    partialText: "",
    finalText: "",
    translatedText: "",
    audioLevel: 0,
    isConnected: config.isRemoteSession,
  });

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

  // State transition with callbacks
  const transitionTo = useCallback(
    (newState: VoiceState) => {
      console.log(`FSM: ${state} → ${newState}`);
      setState(newState);
      config.onStateChange?.(newState);
    },
    [state, config],
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
      try {
        // Step 1: Speech to Text (STT)
        transitionTo("TRANSCRIBING");
        updateData({ partialText: "Processing audio..." });

        // TODO: Replace with actual Gemini STT API call
        const mockSTTResult = await mockSTT(audioBlob, config.fromLang);
        updateData({
          finalText: mockSTTResult.finalText,
          partialText: mockSTTResult.finalText,
        });

        // Step 2: Translation
        transitionTo("TRANSLATING");

        // TODO: Replace with actual DeepL API call
        const translatedText = await mockTranslate(
          mockSTTResult.finalText,
          config.fromLang,
          config.toLang,
        );
        updateData({ translatedText });

        // Step 3: Text to Speech (TTS) and Playback
        transitionTo("SPEAKING");

        if (config.isRemoteSession) {
          // TODO: Publish to Ably for remote users
          await publishToAbly({
            state: "SPEAKING",
            translatedText,
            fromUser: config.userId,
            sessionCode: data.sessionCode,
          });
        } else {
          // Local TTS playback
          await playTTS(translatedText, config.toLang);
        }

        // Return to IDLE
        setTimeout(() => {
          transitionTo("IDLE");
          updateData({
            partialText: "",
            finalText: "",
            translatedText: "",
          });
        }, 1000);
      } catch (error) {
        config.onError?.(`Processing error: ${error}`);
        transitionTo("IDLE");
      }
    },
    [config, data.sessionCode, transitionTo, updateData],
  );

  // Start/Stop microphone listening
  const toggleMicrophone = useCallback(async () => {
    if (!isListeningRef.current) {
      // Start listening
      const success = await initializeMicrophone();
      if (success) {
        isListeningRef.current = true;
        startVAD();
        updateData({ isConnected: true });
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
    }
  }, [initializeMicrophone, startVAD, transitionTo, updateData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    state,
    data,
    isListening: isListeningRef.current,
    toggleMicrophone,
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

async function playTTS(text: string, language: string) {
  // TODO: Replace with ElevenLabs TTS API
  // For now, use browser SpeechSynthesis as fallback
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
