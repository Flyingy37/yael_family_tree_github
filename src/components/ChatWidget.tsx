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
    <span className="inline-flex gap-1 items-center">
      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" />
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
    } catch {
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
        className={`fixed bottom-5 end-5 z-50 w-13 h-13 rounded-full shadow-xl transition-all duration-200 flex items-center justify-center text-xl
          ${open
            ? 'bg-stone-700 hover:bg-stone-600 rotate-0 scale-95'
            : 'bg-amber-700 hover:bg-amber-600 hover:scale-110 active:scale-95'
          }`}
        style={{ width: '3.25rem', height: '3.25rem' }}
      >
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          {open ? '✕' : '🌳'}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={c.title}
          className="fixed bottom-20 end-5 z-50 w-80 sm:w-96 max-h-[78vh] flex flex-col rounded-2xl bg-white/95 backdrop-blur-sm border border-stone-200 shadow-2xl overflow-hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {/* Header — gradient strip */}
          <div className="px-4 py-3 flex-shrink-0 flex items-start justify-between gap-2"
            style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 60%, #d97706 100%)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">🌳</span>
              <div>
                <p className="font-bold text-sm text-white leading-tight">{c.title}</p>
                <p className="text-[11px] text-amber-200 leading-tight mt-0.5">{c.subtitle}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                title={c.clearChat}
                className="mt-0.5 flex-shrink-0 text-amber-200 hover:text-white text-xs transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full"
              >
                {c.clearChat}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[8rem] bg-stone-50/60">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400 text-center pt-1">
                  {c.subtitle}
                </p>
                {c.categories.map(cat => (
                  <div key={cat.label}>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5 px-1">
                      {cat.label}
                    </p>
                    <div className="space-y-1">
                      {cat.questions.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendQuery(q)}
                          className="block w-full text-start text-xs text-stone-700 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl px-3 py-2 transition-all shadow-sm hover:shadow"
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
                className={`flex ${m.role === 'user' ? (isRtl ? 'justify-start' : 'justify-end') : (isRtl ? 'justify-end' : 'justify-start')}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-amber-700 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white text-stone-800 rounded-2xl rounded-tl-sm border border-stone-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <Spinner />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-stone-200 flex-shrink-0 bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={c.placeholder}
              disabled={loading}
              className="flex-1 text-sm rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3.5 py-2 text-sm rounded-xl bg-amber-700 text-white font-medium hover:bg-amber-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {c.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
