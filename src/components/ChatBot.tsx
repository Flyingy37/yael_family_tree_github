import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type Fuse from 'fuse.js';
import type { Person, Family } from '../types';
import { useChat } from '../hooks/useChat';
import { copy } from '../copy';

interface Props {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  personList: Person[];
  searchIndex: Fuse<Person>;
  language: 'he' | 'en';
}

export function ChatBot({ persons, families, personList, searchIndex, language }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, loading, error, sendMessage, clearMessages } = useChat(
    persons,
    families,
    personList,
    searchIndex,
  );

  const isRtl = language === 'he';
  const t = copy.chat;

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function handleSend() {
    if (!inputValue.trim() || loading) return;
    sendMessage(inputValue);
    setInputValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleOpen() {
    setIsOpen(true);
  }

  const hasApiKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY);

  return (
    <>
      {/* Floating action button */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-5 end-5 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-colors"
          aria-label={isRtl ? 'פתח צ׳אט משפחה' : 'Open family chat'}
        >
          <MessageCircle size={26} aria-hidden />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-5 end-5 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(560px,calc(100svh-5rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          role="dialog"
          aria-label={isRtl ? 'צ׳אט עץ משפחה' : 'Family tree chat'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
            <div>
              <div className="font-semibold text-sm">{t.title}</div>
              <div className="text-xs text-blue-100 mt-0.5">{t.subtitle}</div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearMessages}
                  className="text-blue-200 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                  aria-label={isRtl ? 'נקה שיחה' : 'Clear conversation'}
                >
                  {isRtl ? 'נקה' : 'Clear'}
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="text-blue-200 hover:text-white p-1 rounded transition-colors"
                aria-label={t.close}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          {/* Missing API key warning */}
          {!hasApiKey && (
            <div
              id="chatbot-apikey-warning"
              className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex-shrink-0"
            >
              {isRtl
                ? 'מפתח API לא מוגדר. הוסף/י VITE_OPENAI_API_KEY לקובץ .env.local ואתחל/י מחדש.'
                : 'API key not set. Add VITE_OPENAI_API_KEY to .env.local and restart.'}
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && !loading && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center">
                  {isRtl ? 'דוגמאות לשאלות:' : 'Example questions:'}
                </p>
                {t.starters.map(starter => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => sendMessage(starter)}
                    className="w-full text-start text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 transition-colors"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  {t.loading}
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {t.error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-gray-200 px-3 py-2 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={loading || !hasApiKey}
                rows={1}
                aria-describedby={!hasApiKey ? 'chatbot-apikey-warning' : undefined}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 max-h-24 overflow-auto"
                style={{ minHeight: '38px' }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !inputValue.trim() || !hasApiKey}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl p-2 transition-colors flex-shrink-0"
                aria-label={t.submit}
              >
                <Send size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
