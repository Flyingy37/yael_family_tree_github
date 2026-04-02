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
      {/* Modest toggle — small text button at bottom edge */}
      <button
        type="button"
        aria-label={open ? c.close : c.title}
        onClick={() => setOpen(v => !v)}
        className={`fixed bottom-4 end-4 z-40 px-3 py-2 rounded border text-xs transition-colors ${
          open
            ? 'bg-white border-stone-300 text-stone-600 hover:text-stone-900'
            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
        }`}
      >
        {open ? '✕' : c.title}
      </button>

      {/* Chat panel — modest side strip instead of floating overlay */}
      {open && (
        <div
          role="dialog"
          aria-label={c.title}
          className="fixed bottom-14 end-4 z-40 w-72 sm:w-80 max-h-[70vh] flex flex-col rounded border border-stone-200 bg-white overflow-hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header — clean, no gradient */}
          <div className="px-3 py-2.5 flex-shrink-0 flex items-center justify-between gap-2 border-b border-stone-200">
            <div>
              <p className="font-medium text-sm text-stone-900 leading-tight">{c.title}</p>
              <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{c.subtitle}</p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                title={c.clearChat}
                className="flex-shrink-0 text-stone-400 hover:text-stone-600 text-xs transition-colors"
              >
                {c.clearChat}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[6rem] bg-stone-50">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400 text-center pt-1">
                  {c.subtitle}
                </p>
                {c.categories.map(cat => (
                  <div key={cat.label}>
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1.5 px-1">
                      {cat.label}
                    </p>
                    <div className="space-y-1">
                      {cat.questions.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendQuery(q)}
                          className="block w-full text-start text-xs text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 rounded px-2.5 py-1.5 transition-colors"
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
                  className={`max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-stone-800 text-white rounded rounded-tr-none'
                      : 'bg-white text-stone-800 rounded rounded-tl-none border border-stone-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-white border border-stone-200 rounded px-3 py-2">
                  <Spinner />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2 border-t border-stone-200 flex-shrink-0 bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={c.placeholder}
              disabled={loading}
              className="flex-1 text-sm rounded border border-stone-200 bg-stone-50 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-1.5 text-sm rounded bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            >
              {c.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
