/**
 * ChatWidget — floating chat button + panel for querying the family tree.
 *
 * The API endpoint is read from the VITE_CHAT_API_URL environment variable
 * at build time. When the variable is absent the widget is hidden, so
 * deployers who have not wired up the API won't see a broken UI.
 */
import { useState, useRef, useEffect } from 'react';
import { Trees, X } from 'lucide-react';
import { copy } from '../copy';
import type { UiLanguage } from '../hooks/useUiLanguage';

const API_URL = import.meta.env.VITE_CHAT_API_URL as string | undefined;

// ── types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

// ── sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="inline-flex gap-1 items-center text-xs text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

type ChatWidgetProps = {
  language?: UiLanguage;
};

export default function ChatWidget({ language = 'he' }: ChatWidgetProps) {
  const chatCopy = language === 'he' ? copy.chat : copy.chatEn;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't render when API URL is not configured
  if (!API_URL) return null;

  // ── effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── query handler ──────────────────────────────────────────────────────────

  async function sendQuery(queryText: string) {
    const text = queryText.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: nextId.current++, role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: data.answer ?? chatCopy.noMatch },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: chatCopy.error },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuery(input);
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        aria-label={open ? chatCopy.close : chatCopy.title}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 end-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400/90 bg-white text-emerald-700 shadow-md shadow-stone-900/12 transition-all hover:border-amber-500 hover:bg-amber-50/90 hover:shadow-lg hover:shadow-amber-900/15 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-100"
      >
        {open ? (
          <X className="h-5 w-5 text-amber-900" strokeWidth={2.25} aria-hidden />
        ) : (
          <Trees className="h-6 w-6" strokeWidth={2} aria-hidden />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={chatCopy.title}
          className="fixed bottom-20 end-5 z-50 w-80 sm:w-96 max-h-[75vh] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-amber-700 text-white flex-shrink-0">
            <p className="font-bold text-sm">{chatCopy.title}</p>
            <p className="text-xs opacity-80">{chatCopy.subtitle}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[8rem]">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 text-center">
                  {chatCopy.subtitle}
                </p>
                {chatCopy.categories.map(cat => (
                  <div key={cat.label} className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-600">{cat.label}</p>
                    <div className="space-y-1">
                      {cat.questions.map((q: string) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendQuery(q)}
                          className="block w-full text-start text-xs text-gray-700 bg-gray-50 hover:bg-amber-50 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-700 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-xl rounded-tl-sm px-3 py-2">
                  <Spinner />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={chatCopy.placeholder}
              disabled={loading}
              className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-1.5 text-sm rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {chatCopy.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
