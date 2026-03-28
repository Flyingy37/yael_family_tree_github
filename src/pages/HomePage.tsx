import { Link, useNavigate } from 'react-router-dom';
import { useUiLanguage } from '../hooks/useUiLanguage';

const COPY = {
  he: {
    title: 'משפחת לבנת–זיידמן',
    subtitle: 'מסע משפחתי בין דורות, ארצות וסיפורים',
    lead: 'אתר מחקר משפחתי שמאגד אנשים, מקומות וקשרים בין ענפי המשפחה. כאן אפשר לגלות, לא ללכת לאיבוד.',
    ctaExplore: 'כניסה לחקר',
    cards: [
      { view: 'tree',      icon: '🌳', title: 'חפשו אדם או ענף',    text: 'עץ אינטראקטיבי, תתי־עצים וחיפוש חכם בשמות ובמקומות.' },
      { view: 'timeline',  icon: '📅', title: 'ציר זמן משפחתי',     text: 'לידות, פטירות ואירועים לאורך הדורות - בסדר כרונולוגי.' },
      { view: 'map',       icon: '🗺️', title: 'מסע על המפה',         text: 'איפה המשפחה חיה ונעה - נקודות מרכזיות על גבי מפה.' },
      { view: 'insights',  icon: '📊', title: 'תמונת עומק',          text: 'סטטיסטיקות וסינונים מתקדמים למי שרוצה לחקור לעומק.' },
    ],
    about: 'אודות הפרויקט והמקורות',
    lang: 'EN',
  },
  en: {
    title: 'Livnat–Zaidman family',
    subtitle: 'A journey across generations, places, and stories',
    lead: 'A family research site that brings together people, places, and branch connections - built for discovery, not spreadsheet overload.',
    ctaExplore: 'Enter the explorer',
    cards: [
      { view: 'tree',      icon: '🌳', title: 'Find a person or branch', text: 'Interactive tree, subtrees, and smart search across names and places.' },
      { view: 'timeline',  icon: '📅', title: 'Family timeline',          text: 'Births, deaths, and events in chronological order.' },
      { view: 'map',       icon: '🗺️', title: 'Journey on the map',       text: 'Where the family lived and moved - key locations at a glance.' },
      { view: 'insights',  icon: '📊', title: 'Deeper picture',           text: 'Statistics and filters for researchers who want more detail.' },
    ],
    about: 'About this project & sources',
    lang: 'עב',
  },
} as const;

/** Build the correct app URL for a given view and language. */
function viewHref(lang: 'he' | 'en', view: string): string {
  if (view === 'insights') return `/${lang}/insights`;
  if (view === 'tree') return `/${lang}/tree`;
  return `/${lang}/tree?view=${view}`;
}

export default function HomePage() {
  const [language, setLanguage] = useUiLanguage();
  const navigate = useNavigate();
  const t = COPY[language];
  const dir = language === 'he' ? 'rtl' : 'ltr';

  const toggleLang = () => {
    const next = language === 'he' ? 'en' : 'he';
    setLanguage(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100" dir={dir}>
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-stone-800">{t.title}</span>
          <div className="flex items-center gap-2">
            <Link
              to="/about"
              className="text-sm text-amber-900/80 hover:text-amber-950 underline-offset-2 hover:underline"
            >
              {t.about}
            </Link>
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs px-2 py-1 rounded-md border border-stone-300 text-stone-600 hover:bg-stone-50"
            >
              {t.lang}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <section className="text-center mb-14 md:mb-20">
          <p className="text-5xl md:text-6xl mb-4" aria-hidden>🌳</p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-3">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-amber-900/90 font-medium mb-4">{t.subtitle}</p>
          <p className="text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">{t.lead}</p>
          <Link
            to={viewHref(language, 'tree')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold shadow-lg shadow-stone-900/15 hover:bg-stone-800 transition-colors"
          >
            {t.ctaExplore}
            <span aria-hidden>{dir === 'rtl' ? '←' : '→'}</span>
          </Link>
        </section>

        <section className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {t.cards.map(card => (
            <Link
              key={card.view}
              to={viewHref(language, card.view)}
              className="group rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-200/80 transition-all"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h2 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-950 transition-colors">
                {card.title}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">{card.text}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
