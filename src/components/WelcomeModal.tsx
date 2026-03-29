import { useState, useEffect, useCallback } from 'react';
import { Network, PlusCircle, Search, X } from 'lucide-react';

const STORAGE_KEY = 'hasSeenTreeWelcome';

const COPY = {
  he: {
    title: 'ברוכים הבאים לאילן היוחסין',
    body: 'כדי להקל על העומס ולשמור על סדר, האילן מציג בהתחלה רק את המשפחה הגרעינית הקרובה.',
    branchTitle: 'גילוי ענפים נסתרים',
    branchBody: 'לחצו על כפתור ה-(+) ליד כרטיסיית אדם כדי לחשוף את ההורים, האחים והילדים שלו.',
    searchTitle: 'חיפוש מהיר',
    searchBody: 'השתמשו בשורת החיפוש למעלה כדי לאתר קרוב משפחה ספציפי ולקפוץ ישירות אליו.',
    cta: 'התחל לחקור',
    closeLabel: 'סגור',
  },
  en: {
    title: 'Welcome to the family tree',
    body: 'To keep things readable, the tree starts with a compact view of the core close family.',
    branchTitle: 'Reveal hidden branches',
    branchBody: 'Click the (+) button next to a person card to show their parents, siblings, and children.',
    searchTitle: 'Quick search',
    searchBody: 'Use the search bar above to find someone and jump straight to them.',
    cta: 'Start exploring',
    closeLabel: 'Close',
  },
} as const;

interface WelcomeModalProps {
  language: 'he' | 'en';
}

export function WelcomeModal({ language }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const t = COPY[language];
  const isRtl = language === 'he';

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [isVisible]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* private mode / quota */
    }
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      role="presentation"
      onClick={e => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-description"
        className={`bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 relative transition-all duration-300 ease-out ${
          entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={t.closeLabel}
        >
          <X size={20} aria-hidden />
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Network size={32} aria-hidden />
          </div>
        </div>

        <h2 id="welcome-modal-title" className="text-2xl font-bold text-center text-slate-800 mb-2">
          {t.title}
        </h2>
        <div id="welcome-modal-description" className="text-center text-slate-600 mb-6 text-sm space-y-4">
          <p>{t.body}</p>
          <div className="space-y-4 text-start">
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <PlusCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={20} aria-hidden />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{t.branchTitle}</h3>
              <p className="text-xs text-slate-500">{t.branchBody}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Search className="text-blue-500 mt-0.5 flex-shrink-0" size={20} aria-hidden />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{t.searchTitle}</h3>
              <p className="text-xs text-slate-500">{t.searchBody}</p>
            </div>
          </div>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          autoFocus
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          {t.cta}
        </button>
      </div>
    </div>
  );
}
