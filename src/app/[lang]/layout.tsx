/**
 * LangLayout — root layout for /:lang/* routes.
 * Validates the lang param (he | en), syncs with localStorage,
 * provides LangContext to all child pages via <Outlet />.
 */
import { createContext, useContext, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link } from 'react-router-dom';
import { useUiLanguage, type UiLanguage } from '../../hooks/useUiLanguage';
import ChatWidget from '../../components/ChatWidget';

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
        <ChatWidget />
      </div>
    </LangContext.Provider>
  );
}
