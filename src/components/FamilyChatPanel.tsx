import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

type Lang = 'he' | 'en';

const COPY: Record<
  Lang,
  {
    title: string;
    placeholder: string;
    submit: string;
    loading: string;
    close: string;
    starters: string[];
    intro: string;
    unavailable: string;
    errorPrefix: string;
  }
> = {
  he: {
    title: 'שאל/י על המשפחה',
    placeholder: 'שאל/י שאלה על המשפחה…',
    submit: 'שליחה',
    loading: 'מחפש ברשומות…',
    close: 'סגירה',
    starters: [
      'מי שורש עץ המשפחה?',
      'כמה אנשים יש בעץ?',
      'מה ידוע על סבא נחום אלפרוביץ׳?',
    ],
    intro: 'בחרו דוגמה או כתבו שאלה:',
    unavailable:
      'הצ׳אט זמין בפריסת Vercel. בפיתוח מקומי: הריצו `vercel dev` והגדירו מפתח AI, או בדקו ש־/api לא מנותב ל־index.html.',
    errorPrefix: 'שגיאה:',
  },
  en: {
    title: 'Ask about the family',
    placeholder: 'Ask a question about the family tree…',
    submit: 'Send',
    loading: 'Searching records…',
    close: 'Close',
    starters: [
      'Who is the root of the family tree?',
      'How many people are in the tree?',
      'What do we know about Nachum Alperovich?',
    ],
    intro: 'Try a starter or type your question:',
    unavailable:
      'Chat runs on the Vercel deployment. For local dev use `vercel dev` with AI credentials, and ensure /api routes are not rewritten to index.html.',
    errorPrefix: 'Error:',
  },
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface Props {
  language: Lang;
}

export function FamilyChatPanel({ language }: Props) {
  const t = COPY[language];
  const isRtl = language === 'he';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, busy]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);
      const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
      setMessages(nextMessages);
      setInput('');
      setBusy(true);

      let assistantContent = '';

      try {
        const res = await fetch('/api/family-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages,
            language,
          }),
        });

        if (!res.ok) {
          let msg = res.statusText;
          try {
            const j = (await res.json()) as { error?: string; errorHe?: string };
            msg = language === 'he' && j.errorHe ? j.errorHe : j.error || msg;
          } catch {
            /* ignore */
          }
          if (res.status === 404) {
            setError(t.unavailable);
          } else {
            setError(`${t.errorPrefix} ${msg}`);
          }
          setBusy(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError(`${t.errorPrefix} no response body`);
          setBusy(false);
          return;
        }

        setMessages([...nextMessages, { role: 'assistant', content: '' }]);
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setMessages([...nextMessages, { role: 'assistant', content: assistantContent }]);
        }
      } catch {
        setError(t.unavailable);
      } finally {
        setBusy(false);
      }
    },
    [busy, language, messages, t]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          backgroundColor: open ? '#4f46e5' : '#ffffff',
          color: open ? '#ffffff' : '#374151',
          outline: open ? 'none' : '1px solid #e5e7eb',
        }}
        title={t.title}
      >
        <MessageCircle size={13} />
        {t.title}
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            width: 'min(100%, 320px)',
            maxHeight: 'min(70vh, 420px)',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(15,23,42,0.12)',
            overflow: 'hidden',
          }}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{t.title}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                color: '#64748b',
              }}
              aria-label={t.close}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 10px',
              fontSize: 11.5,
              lineHeight: 1.55,
              color: '#334155',
            }}
          >
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#64748b', fontSize: 11 }}>{t.intro}</span>
                {t.starters.map(s => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => send(s)}
                    style={{
                      textAlign: isRtl ? 'right' : 'left',
                      fontSize: 11,
                      padding: '6px 8px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      cursor: busy ? 'default' : 'pointer',
                      color: '#1e293b',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: m.role === 'user' ? '#eff6ff' : '#f1f5f9',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>
                  {m.role === 'user' ? (language === 'he' ? 'את/ה' : 'You') : language === 'he' ? 'עוזר' : 'Assistant'}
                </div>
                {m.content || (busy && m.role === 'assistant' ? '…' : '')}
              </div>
            ))}
            {busy && messages[messages.length - 1]?.role === 'user' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11 }}>
                <Loader2 size={14} className="animate-spin shrink-0" />
                {t.loading}
              </div>
            )}
            {error && (
              <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 11 }}>
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              send(input);
            }}
            style={{
              display: 'flex',
              gap: 6,
              padding: '8px 10px',
              borderTop: '1px solid #f1f5f9',
              background: '#fff',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.placeholder}
              disabled={busy}
              style={{
                flex: 1,
                fontSize: 12,
                padding: '6px 8px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: busy || !input.trim() ? '#cbd5e1' : '#4f46e5',
                color: '#fff',
                cursor: busy || !input.trim() ? 'default' : 'pointer',
              }}
              aria-label={t.submit}
            >
              {busy ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
