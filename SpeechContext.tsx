import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';

interface SpeakParams {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
}

interface SpeechContextType {
  speak: (params: SpeakParams) => void;
  cancel: () => void;
  isSpeaking: boolean;
  currentlySpeakingText: string | null;
  isSupported: boolean;
}

export const SpeechContext = createContext<SpeechContextType | null>(null);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      utteranceRef.current = new SpeechSynthesisUtterance();
      utteranceRef.current.onstart = () => setIsSpeaking(true);
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingText(null);
      };
      utteranceRef.current.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingText(null);
      };

      // Cleanup on unmount
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback(({ text, lang = 'en-US', rate = 1, pitch = 1 }: SpeakParams) => {
    if (!isSupported || !utteranceRef.current) return;

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = utteranceRef.current;
    utterance.text = text;
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    setCurrentlySpeakingText(text);
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentlySpeakingText(null);
  }, [isSupported]);

  const value = {
    speak,
    cancel,
    isSpeaking,
    currentlySpeakingText,
    isSupported,
  };

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
};