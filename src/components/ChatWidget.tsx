/**
 * ChatWidget — floating chat button + panel for querying the family tree.
 *
 * The API endpoint is read from the VITE_CHAT_API_URL environment variable
 * at build time. When the variable is absent the widget is hidden, so
 * deployers who have not wired up the API won't see a broken UI.
 */
import { useState, useRef, useEffect } from 'react';
import { copy } from '../copy';

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

export default function ChatWidget() {
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
        { id: nextId.current++, role: 'assistant', text: data.answer ?? copy.chat.noMatch },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, role: 'assistant', text: copy.chat.error },
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
        aria-label={open ? copy.chat.close : copy.chat.title}
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-5 end-5 z-50 w-12 h-12 rounded-full bg-amber-700 text-white shadow-lg hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center text-xl"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={copy.chat.title}
          className="fixed bottom-20 end-5 z-50 w-80 sm:w-96 max-h-[75vh] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-amber-700 text-white flex-shrink-0">
            <p className="font-bold text-sm">{copy.chat.title}</p>
            <p className="text-xs opacity-80">{copy.chat.subtitle}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[8rem]">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center">
                  {copy.chat.subtitle}
                </p>
                {copy.chat.starters.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendQuery(s)}
                    className="block w-full text-start text-xs text-gray-700 bg-gray-50 hover:bg-amber-50 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
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
              placeholder={copy.chat.placeholder}
              disabled={loading}
              className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3 py-1.5 text-sm rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copy.chat.submit}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
