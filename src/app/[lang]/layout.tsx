/**
 * LangLayout — root layout for /:lang/* routes.
 * Validates the lang param (he | en), syncs with localStorage,
 * provides LangContext to all child pages via <Outlet />.
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { Outlet, useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiLanguage, type UiLanguage } from '../../hooks/useUiLanguage';
import { useHotSync } from '../../hooks/useHotSync';
import { Menu, X, Moon } from 'lucide-react';

const ChatWidget = lazy(() => import('../../components/ChatWidget'));

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

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

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

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
        {/* ── Skip link for accessibility ──────────────────────────── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          {t('דלג לתוכן ראשי', 'Skip to main content')}
        </a>

        {/* ── Top nav ───────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t('סגור תפריט', 'Close menu') : t('פתח תפריט', 'Open menu')}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link
            to={`/${lang}/tree`}
            className="flex items-center gap-1 text-lg font-bold text-gray-800 whitespace-nowrap hover:text-amber-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded"
          >
            <span aria-hidden="true">🌳</span>
            <span>{t('משפחת ליבנת-זיידמן', 'Livnat-Zaidman Family Tree')}</span>
          </Link>

          <div className="flex items-center gap-1 text-sm text-gray-500 mx-2">
            <span>|</span>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            <Link
              to={`/${lang}/branches/ginzburg-liandres`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">🧭</span>
              <span>{t('ענפים', 'Branches')}</span>
            </Link>
            <Link
              to={`/${lang}/tree`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">🌳</span>
              <span>{t('עץ', 'Tree')}</span>
            </Link>
            <Link
              to={`/${lang}/insights`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">📊</span>
              <span>{t('תובנות', 'Insights')}</span>
            </Link>
            <Link
              to={`/${lang}/archive`}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">📚</span>
              <span>{t('ארכיון', 'Archive')}</span>
            </Link>
          </nav>

          <div className="flex-1" />

          {/* Language switcher & Dark mode */}
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                const html = document.documentElement;
                const isDark = html.classList.contains('dark');
                html.classList.toggle('dark', !isDark);
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={t('החלף למצב כהה', 'Toggle dark mode')}
            >
              <Moon className="w-5 h-5" />
            </button>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              {(['he', 'en'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
                    lang === l
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium text-gray-800 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────── */}
        <main id="main-content" className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={langParam}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Mobile menu overlay ─────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                onKeyDown={(e) => e.key === 'Escape' && closeMobileMenu()}
                role="button"
                tabIndex={0}
                aria-label={t('סגור תפריט', 'Close menu')}
              />
              <motion.div 
                className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-xl p-6 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label={t('תפריט ניווט', 'Navigation menu')}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-gray-800">
                  {t('ניווט', 'Menu')}
                </span>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={t('סגור תפריט', 'Close menu')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  to={`/${lang}/branches/ginzburg-liandres`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">🧭</span>
                  <span className="text-base font-medium">{t('ענפים', 'Branches')}</span>
                </Link>
                <Link
                  to={`/${lang}/tree`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">🌳</span>
                  <span className="text-base font-medium">{t('עץ משפחה', 'Family Tree')}</span>
                </Link>
                <Link
                  to={`/${lang}/insights`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">📊</span>
                  <span className="text-base font-medium">{t('תובנות', 'Insights')}</span>
                </Link>
                <Link
                  to={`/${lang}/archive`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">📚</span>
                  <span className="text-base font-medium">{t('ארכיון', 'Archive')}</span>
                </Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── Floating chat widget ───────────────────────────────────── */}
        <Suspense fallback={null}>
          <ChatWidget language={lang} />
        </Suspense>

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
