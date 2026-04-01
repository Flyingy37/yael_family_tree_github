/**
 * LangLayout — root layout for /:lang/* routes.
 * Validates the lang param (he | en), syncs with localStorage,
 * provides LangContext to all child pages via <Outlet />.
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Outlet, useParams, useNavigate, Link } from 'react-router-dom';
import { useUiLanguage, type UiLanguage } from '../../hooks/useUiLanguage';
import ChatWidget from '../../components/ChatWidget';
import { useHotSync } from '../../hooks/useHotSync';

// ── Language context ──────────────────────────────────────────────────────────
interface LangContextValue {
  lang: UiLanguage;
  setLang: (l: UiLanguage) => void;
  t: (he: string, en: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: 'he',
  setLang: () => {},
  t: (he) => he,
});

export function useLang() {
  return useContext(LangContext);
}

// ── Layout component ──────────────────────────────────────────────────────────
export default function LangLayout() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [lang, setLangState] = useUiLanguage();

  // ── Hot Sync toast ─────────────────────────────────────────────────────────
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHotSync = useCallback((msg: { message: string; branch_name: string | null }) => {
    const text = msg.branch_name
      ? `🔄 עדכון! נוספו פרטים חדשים על ענף ${msg.branch_name}`
      : `🔄 ${msg.message}`;
    // Clear any previous timer so back-to-back updates don't dismiss early
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSyncToast(text);
    toastTimerRef.current = setTimeout(() => setSyncToast(null), 8000);
  }, []);

  useHotSync(handleHotSync);

  // Validate param — redirect to /he if unknown
  useEffect(() => {
    if (langParam !== 'he' && langParam !== 'en') {
      navigate('/he/tree', { replace: true });
    }
  }, [langParam, navigate]);

  // Keep URL param in sync with stored preference
  useEffect(() => {
    if (langParam === 'he' || langParam === 'en') {
      setLangState(langParam);
    }
  }, [langParam, setLangState]);

  const setLang = (l: UiLanguage) => {
    // Swap /he/ <-> /en/ in current path
    const newPath = window.location.pathname.replace(
      /^\/(he|en)\//,
      `/${l}/`
    );
    navigate(newPath, { replace: true });
  };

  const t = (he: string, en: string) => (lang === 'he' ? he : en);

  if (langParam !== 'he' && langParam !== 'en') return null;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div
        className="h-screen flex flex-col bg-gray-50"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        {/* ── Top nav ───────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <Link
            to={`/${lang}/tree`}
            className="text-lg font-bold text-gray-800 whitespace-nowrap hover:text-amber-700 transition-colors"
          >
            🌳 {t('משפחת ליבנת-זיידמן', 'Livnat-Zaidman Family Tree')}
          </Link>

          <div className="flex items-center gap-1 text-sm text-gray-500 mx-2">
            <span>|</span>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <Link
              to={`/${lang}/tree`}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {t('🌳 עץ', '🌳 Tree')}
            </Link>
            <Link
              to={`/${lang}/insights`}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {t('📊 תובנות', '📊 Insights')}
            </Link>
            <Link
              to={`/${lang}/archive`}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {t('📚 ארכיון', '📚 Archive')}
            </Link>
          </nav>

          <div className="flex-1" />

          {/* Language switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['he', 'en'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  lang === l
                    ? 'bg-white shadow-sm font-medium text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* ── Floating chat widget ───────────────────────────────────── */}
        <ChatWidget language={lang} />

        {/* ── Hot Sync toast ────────────────────────────────────────── */}
        {syncToast && (
          <div
            dir={lang === 'he' ? 'rtl' : 'ltr'}
            className="fixed top-16 start-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4 px-4 py-3 rounded-xl bg-amber-700 text-white text-sm shadow-xl flex items-start gap-3 animate-bounce-once"
            style={{ animation: 'slideDown 0.3s ease-out' }}
          >
            <span className="flex-1 leading-snug">{syncToast}</span>
            <button
              type="button"
              onClick={() => setSyncToast(null)}
              className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0"
              aria-label="סגור"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </LangContext.Provider>
  );
}
