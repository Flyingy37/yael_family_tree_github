/**
 * ChatWidget — floating chat button + panel for querying the family tree.
 *
 * The API endpoint defaults to /api/chat/query (same-origin serverless fn).
 * Override with VITE_CHAT_API_URL at build time if needed.
 */
import { useState, useRef, useEffect } from 'react';
import { copy } from '../copy';

const API_URL: string =
  (import.meta.env.VITE_CHAT_API_URL as string | undefined) ?? '/api/chat/query';

// ── types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatWidgetProps {
  language?: 'he' | 'en';
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

export default function ChatWidget({ language = 'he' }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const nextId = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const c = language === 'en' ? copy.chatEn : copy.chat;
  const isRtl = language === 'he';

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

      // If the server resolved a specific person, signal the tree to focus on them
      if (data.personId) {
        window.dispatchEvent(
          new CustomEvent('familyTreeFocus', { detail: { personId: data.personId } })
        );
      }

      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: data.answer ?? c.noMatch },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: c.error },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuery(input);
  }

  function clearChat() {
    setMessages([]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        aria-label={open ? c.close : c.title}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 end-5 z-50 w-12 h-12 rounded-full bg-amber-700 text-white shadow-lg hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center text-xl"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={c.title}
          className="fixed bottom-20 end-5 z-50 w-80 sm:w-96 max-h-[75vh] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-amber-700 text-white flex-shrink-0 flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-sm">{c.title}</p>
              <p className="text-xs opacity-80">{c.subtitle}</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                title={c.clearChat}
                className="mt-0.5 flex-shrink-0 text-white/70 hover:text-white text-xs underline underline-offset-2 transition-colors"
              >
                {c.clearChat}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[8rem]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center">
                  {c.subtitle}
                </p>
                {c.categories.map(cat => (
                  <div key={cat.label}>
                    <p className="text-xs font-semibold text-gray-500 mb-1 px-1">{cat.label}</p>
                    <div className="space-y-1">
                      {cat.questions.map(q => (
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
              placeholder={c.placeholder}
              disabled={loading}
              className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-1.5 text-sm rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {c.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
