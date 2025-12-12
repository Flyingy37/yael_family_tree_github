
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { SavedWord } from '../types';

const WORD_BANK_STORAGE_KEY = 'mika-word-bank';

interface WordBankContextType {
  savedWords: SavedWord[];
  addWord: (word: string, explanation: SavedWord['explanation']) => void;
  removeWord: (id: string) => void;
  isWordSaved: (word: string) => boolean;
}

export const WordBankContext = createContext<WordBankContextType | undefined>(undefined);

export const WordBankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);

  useEffect(() => {
    try {
      const storedWords = localStorage.getItem(WORD_BANK_STORAGE_KEY);
      if (storedWords) {
        setSavedWords(JSON.parse(storedWords) as SavedWord[]);
      }
    } catch (error) {
      console.error("Failed to load words from storage", error);
    }
  }, []);

  const updateStorage = (words: SavedWord[]) => {
    try {
      localStorage.setItem(WORD_BANK_STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
      console.error("Failed to save words to storage", error);
    }
  };

  const addWord = useCallback((word: string, explanation: SavedWord['explanation']) => {
    setSavedWords(prevWords => {
      if (prevWords.some(sw => sw.word.toLowerCase() === word.toLowerCase())) {
        return prevWords;
      }

      const newWord: SavedWord = {
        id: crypto.randomUUID(),
        word: word,
        explanation: explanation,
        addedAt: new Date().toISOString(),
      };

      const newWords = [newWord, ...prevWords];
      updateStorage(newWords);
      return newWords;
    });
  }, []);

  const removeWord = useCallback((id: string) => {
    setSavedWords(prevWords => {
      const newWords = prevWords.filter(word => word.id !== id);
      updateStorage(newWords);
      return newWords;
    });
  }, []);

  const isWordSaved = useCallback((word: string) => {
    return savedWords.some(sw => sw.word.toLowerCase() === word.toLowerCase());
  }, [savedWords]);

  const value = useMemo(() => ({ savedWords, addWord, removeWord, isWordSaved }), [savedWords, addWord, removeWord, isWordSaved]);

  return (
    <WordBankContext.Provider value={value}>
      {children}
    </WordBankContext.Provider>
  );
};

export const useWordBank = (): WordBankContextType => {
  const context = useContext(WordBankContext);
  if (!context) {
    throw new Error('useWordBank must be used within a WordBankProvider');
  }
  return context;
};