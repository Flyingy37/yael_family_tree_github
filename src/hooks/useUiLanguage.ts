import { useState, useEffect, useCallback } from 'react';

export type UiLanguage = 'en' | 'he';

const LANGUAGE_STORAGE_KEY = 'appLanguage';
const LANGUAGE_EXPLICIT_STORAGE_KEY = 'appLanguageExplicitlySet';

function readInitialLanguage(): UiLanguage {
  if (typeof window === 'undefined') return 'he';
  const explicit = window.localStorage.getItem(LANGUAGE_EXPLICIT_STORAGE_KEY) === '1';
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (explicit && (stored === 'en' || stored === 'he')) return stored;
  return 'he';
}

/** Shared EN/HE toggle across marketing pages and explorer (localStorage). */
export function useUiLanguage(): [UiLanguage, (lang: UiLanguage) => void] {
  const [language, setLanguageState] = useState<UiLanguage>(readInitialLanguage);

  const setLanguage = useCallback((lang: UiLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      window.localStorage.setItem(LANGUAGE_EXPLICIT_STORAGE_KEY, '1');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return [language, setLanguage];
}
