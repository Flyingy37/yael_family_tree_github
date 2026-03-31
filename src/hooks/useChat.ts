import { useState, useCallback, useRef } from 'react';
import type Fuse from 'fuse.js';
import type { Person, Family } from '../types';
import { askFamilyQuestion, type ChatMessage } from '../services/chatService';

export interface UseChatResult {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
}

export function useChat(
  persons: Map<string, Person>,
  families: Map<string, Family>,
  personList: Person[],
  searchIndex: Fuse<Person>,
): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: ChatMessage = { role: 'user', content: text.trim() };
      // Capture history before the user message so it can be sent to the API.
      const historyBeforeUser = messages;
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      askFamilyQuestion(
        text.trim(),
        historyBeforeUser,
        persons,
        families,
        personList,
        searchIndex,
        controller.signal,
      )
        .then(reply => {
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setError(msg);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [loading, messages, persons, families, personList, searchIndex],
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
}

