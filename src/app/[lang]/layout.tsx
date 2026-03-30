/**
 * LangLayout — root layout for /:lang/* routes.
 * Validates the lang param (he | en), syncs with localStorage,
 * provides LangContext to all child pages via <Outlet />.
 */
import { createContext, useContext, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link, NavLink } from 'react-router-dom';
import { useUiLanguage, type UiLanguage } from '../../hooks/useUiLanguage';

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
        className="flex h-dvh min-h-0 flex-col bg-gray-50"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        <a
          href="#main-content"
          className="fixed start-4 top-0 z-[200] -translate-y-full rounded-md bg-amber-800 px-3 py-2 text-sm font-medium text-white shadow-lg transition-transform focus:translate-y-4 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          {t('דלג לתוכן', 'Skip to content')}
        </a>
        {/* ── Top nav ───────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <Link
            to={`/${lang}/tree`}
            className="text-lg font-bold text-gray-800 whitespace-nowrap hover:text-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-sm"
          >
            🌳 {t('משפחת ליבנת-זיידמן', 'Livnat-Zaidman Family Tree')}
          </Link>

          <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400 mx-1" aria-hidden>
            <span>|</span>
          </div>

          <nav
            className="flex flex-wrap items-center gap-1 text-sm"
            aria-label={t('ניווט ראשי', 'Main navigation')}
          >
            <NavLink
              to={`/${lang}/tree`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('🌳 עץ', '🌳 Tree')}
            </NavLink>
            <NavLink
              to={`/${lang}/research`}
              end
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('🔬 מחקר', '🔬 Research')}
            </NavLink>
            <NavLink
              to={`/${lang}/people`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('אנשים', 'People')}
            </NavLink>
            <NavLink
              to={`/${lang}/research/merge`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('מיזוגים', 'Merge')}
            </NavLink>
            <NavLink
              to={`/${lang}/research/dna`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('DNA', 'DNA')}
            </NavLink>
            <NavLink
              to={`/${lang}/insights`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('📊 תובנות', '📊 Insights')}
            </NavLink>
            <NavLink
              to={`/${lang}/archive`}
              className={({ isActive }) =>
                `px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-amber-100 text-amber-950 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {t('📚 ארכיון', '📚 Archive')}
            </NavLink>
          </nav>

          <div className="flex-1 min-w-[1rem]" />

          {/* Language switcher */}
          <div
            className="flex gap-1 bg-gray-100 rounded-lg p-0.5"
            role="group"
            aria-label={t('בחירת שפת ממשק', 'Interface language')}
          >
            {(['he', 'en'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                aria-label={l === 'he' ? t('עברית', 'Hebrew') : t('אנגלית', 'English')}
                className={`px-2 py-1 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
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
        <main
          className="flex-1 overflow-hidden min-h-0"
          id="main-content"
          aria-label={t('תוכן האפליקציה', 'Application content')}
        >
          <Outlet />
        </main>
      </div>
    </LangContext.Provider>
  );
}
