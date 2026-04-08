import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, MapPinned, Network, Search as SearchIcon, Sparkles } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { useFamilyData } from '../hooks/useFamilyData';
import { useUiLanguage } from '../hooks/useUiLanguage';

type Language = 'he' | 'en';

type HomeStat = {
  value: string;
  label: string;
};

type HomeLink = {
  to: string;
  icon: JSX.Element;
  title: string;
  text: string;
};

const COPY = {
  he: {
    title: 'משפחת ליבנת-זיידמן',
    subtitle: 'מסע משפחתי בין דורות, ארצות וסיפורים',
    lead:
      'אתר מחקר משפחתי שמאגד אנשים, מקומות וקשרים בין ענפי המשפחה. כאן אפשר לגלות, לחפש, ולהתחיל מסיפור אחד קטן שמוביל לענף שלם.',
    ctaExplore: 'כניסה לחקר',
    ctaAbout: 'אודות ומקורות',
    searchTitle: 'חיפוש מהיר כבר מהכניסה',
    searchBody:
      'אפשר להתחיל בשם של אדם, מקום או קשר משפחתי, ולקפוץ ישר לפרופיל המתאים בלי לעבור קודם דרך כל העץ.',
    searchNote: 'הקלידו לפחות 2 אותיות כדי לקבל תוצאות.',
    statsTitle: 'מבט מהיר על המאגר',
    statsLoading: 'טוען את נתוני העץ...',
    quickTitle: 'שלושה מסלולים טובים להתחלה',
    quickLinks: [
      {
        view: 'tree',
        title: 'לצלול ישר לעץ',
        text: 'תצוגת העץ המלאה עם חיפוש, תתי-עצים וסינון לפי דורות וענפים.',
      },
      {
        view: 'map',
        title: 'לעקוב אחרי המקומות',
        text: 'מפה שמרכזת לידות, מגורים והגירות כשיש נתוני מקום זמינים.',
      },
      {
        view: 'insights',
        title: 'לראות דפוסים',
        text: 'עמוד תובנות עם פילוחים, סטטיסטיקות ונקודות מבט מחקריות.',
      },
    ],
    cards: [
      { view: 'tree', icon: '🌳', title: 'חפשו אדם או ענף', text: 'עץ אינטראקטיבי, תתי-עצים וחיפוש חכם בשמות ובמקומות.' },
      { view: 'timeline', icon: '📅', title: 'ציר זמן משפחתי', text: 'לידות, פטירות ואירועים לאורך הדורות בסדר כרונולוגי.' },
      { view: 'map', icon: '🗺️', title: 'מסע על המפה', text: 'איפה המשפחה חיה ונעה, בנקודות מרכזיות שקל לזהות.' },
      { view: 'insights', icon: '📊', title: 'תמונת עומק', text: 'סטטיסטיקות וסינונים מתקדמים למי שרוצה לחקור לעומק.' },
      { view: 'archive', icon: '📚', title: 'ארכיון נרטיבי', text: 'סיפורים, מכתבים וחיפוש חכם לפי שמות וכינויים היסטוריים.' },
    ],
    about: 'אודות הפרויקט והמקורות',
    lang: 'EN',
    statsLabels: {
      people: 'אנשים',
      families: 'משפחות',
      places: 'מקומות',
      generations: 'דורות',
    },
    rootCta: 'התחילו מהפרופיל של יעל',
    rootFallback: 'יעל',
  },
  en: {
    title: 'Livnat-Zaidman family',
    subtitle: 'A journey across generations, places, and stories',
    lead:
      'A family research site that brings together people, places, and branch connections. You can start with one person, one place, or one clue and follow it into a wider family story.',
    ctaExplore: 'Enter the explorer',
    ctaAbout: 'About & sources',
    searchTitle: 'Quick search from the front door',
    searchBody:
      'Start with a person, a place, or a relationship and jump straight to a matching profile without first navigating the full tree.',
    searchNote: 'Type at least 2 characters to see matches.',
    statsTitle: 'A fast look at the archive',
    statsLoading: 'Loading family graph data...',
    quickTitle: 'Three strong ways to begin',
    quickLinks: [
      {
        view: 'tree',
        title: 'Dive into the tree',
        text: 'The main explorer with smart search, subtree focus, and generation filters.',
      },
      {
        view: 'map',
        title: 'Follow the places',
        text: 'A geographic view of known births, residences, and migration routes.',
      },
      {
        view: 'insights',
        title: 'See patterns',
        text: 'Research-oriented insights, breakdowns, and summary views across the archive.',
      },
    ],
    cards: [
      { view: 'tree', icon: '🌳', title: 'Find a person or branch', text: 'Interactive tree, subtree focus, and smart search across names and places.' },
      { view: 'timeline', icon: '📅', title: 'Family timeline', text: 'Births, deaths, and events in a chronological view.' },
      { view: 'map', icon: '🗺️', title: 'Journey on the map', text: 'Where the family lived and moved, in one geographic layer.' },
      { view: 'insights', icon: '📊', title: 'Deeper picture', text: 'Statistics and filters for researchers who want more detail.' },
      { view: 'archive', icon: '📚', title: 'Narrative archive', text: 'Stories, letters, and smart search across historical name variants.' },
    ],
    about: 'About this project & sources',
    lang: 'עב',
    statsLabels: {
      people: 'People',
      families: 'Families',
      places: 'Places',
      generations: 'Generations',
    },
    rootCta: "Start with Yael's profile",
    rootFallback: 'Yael',
  },
} as const;

function viewHref(lang: Language, view: string): string {
  if (view === 'insights') return `/${lang}/insights`;
  if (view === 'archive') return `/${lang}/archive`;
  if (view === 'tree') return `/${lang}/tree`;
  return `/${lang}/tree?view=${view}`;
}

function buildStats(language: Language, personCount: number, familyCount: number, placeCount: number, generationCount: number): HomeStat[] {
  const labels = COPY[language].statsLabels;
  return [
    { value: personCount.toLocaleString(), label: labels.people },
    { value: familyCount.toLocaleString(), label: labels.families },
    { value: placeCount.toLocaleString(), label: labels.places },
    { value: generationCount.toLocaleString(), label: labels.generations },
  ];
}

export default function HomePage() {
  const [language, setLanguage] = useUiLanguage();
  const navigate = useNavigate();
  const { personList, families, rootPersonId, searchIndex, loading } = useFamilyData();
  const t = COPY[language];
  const dir = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.title = language === 'he'
      ? 'אילן יוחסין - משפחת ליבנת-זיידמן'
      : 'Livnat-Zaidman family tree';
  }, [dir, language]);

  const toggleLang = () => {
    const next = language === 'he' ? 'en' : 'he';
    setLanguage(next);
  };

  const stats = useMemo(() => {
    const uniquePlaces = new Set<string>();
    let minGeneration = Number.POSITIVE_INFINITY;
    let maxGeneration = Number.NEGATIVE_INFINITY;

    for (const person of personList) {
      if (person.birthPlace) uniquePlaces.add(person.birthPlace);
      if (typeof person.generation === 'number') {
        minGeneration = Math.min(minGeneration, person.generation);
        maxGeneration = Math.max(maxGeneration, person.generation);
      }
    }

    const generationCount = Number.isFinite(minGeneration) && Number.isFinite(maxGeneration)
      ? maxGeneration - minGeneration + 1
      : 0;

    return buildStats(language, personList.length, families.size, uniquePlaces.size, generationCount);
  }, [families.size, language, personList]);

  const quickLinks = useMemo<HomeLink[]>(() => [
    {
      to: viewHref(language, 'tree'),
      icon: <Network size={18} aria-hidden />,
      title: t.quickLinks[0].title,
      text: t.quickLinks[0].text,
    },
    {
      to: viewHref(language, 'map'),
      icon: <MapPinned size={18} aria-hidden />,
      title: t.quickLinks[1].title,
      text: t.quickLinks[1].text,
    },
    {
      to: viewHref(language, 'insights'),
      icon: <Compass size={18} aria-hidden />,
      title: t.quickLinks[2].title,
      text: t.quickLinks[2].text,
    },
  ], [language, t.quickLinks]);

  const rootPerson = useMemo(
    () => personList.find(person => person.id === rootPersonId) ?? null,
    [personList, rootPersonId]
  );

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_38%),linear-gradient(180deg,_#fffbeb_0%,_#f8fafc_45%,_#f1f5f9_100%)]"
      dir={dir}
    >
      <header className="border-b border-stone-200/80 bg-white/75 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <span className={`text-sm font-semibold text-stone-800 ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
            {t.title}
          </span>
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
              className="text-xs px-2.5 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              {t.lang}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8 items-start">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(120,53,15,0.08)] backdrop-blur-sm p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 text-amber-950 px-3 py-1 text-xs font-semibold mb-5">
              <Sparkles size={14} aria-hidden />
              {t.subtitle}
            </div>

            <h1 className={`text-4xl md:text-6xl mb-4 text-stone-950 ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-stone-700 max-w-2xl leading-relaxed mb-8">
              {t.lead}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                to={viewHref(language, 'tree')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 text-white text-sm font-semibold shadow-lg shadow-stone-900/15 hover:bg-stone-800 transition-colors"
              >
                {t.ctaExplore}
                <span aria-hidden>{dir === 'rtl' ? '←' : '→'}</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-300 bg-white text-stone-800 text-sm font-semibold hover:border-stone-400 hover:bg-stone-50 transition-colors"
              >
                {t.ctaAbout}
              </Link>
              <Link
                to={`/${language}/person/${encodeURIComponent(rootPersonId)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm font-semibold hover:bg-amber-100 transition-colors"
              >
                {t.rootCta}
                <span className="text-amber-800/80">{rootPerson?.givenName || t.rootFallback}</span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {loading
                ? Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-4 animate-pulse"
                    >
                      <div className="h-7 w-16 bg-stone-200 rounded mb-2" />
                      <div className="h-4 w-24 bg-stone-200 rounded" />
                    </div>
                  ))
                : stats.map(stat => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-stone-200 bg-stone-50/85 px-4 py-4"
                    >
                      <div className="text-2xl font-bold text-stone-950">{stat.value}</div>
                      <div className="text-sm text-stone-600">{stat.label}</div>
                    </div>
                  ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-stone-200/80 bg-stone-950 text-stone-50 shadow-[0_24px_70px_rgba(15,23,42,0.22)] p-6 md:p-7">
            <div className="flex items-center gap-2 text-amber-300 mb-4">
              <SearchIcon size={18} aria-hidden />
              <h2 className={`text-2xl text-white m-0 ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
                {t.searchTitle}
              </h2>
            </div>
            <p className="text-stone-300 mb-5 text-sm md:text-base leading-relaxed">
              {t.searchBody}
            </p>
            <SearchBar
              searchIndex={searchIndex}
              onSelect={(personId) => navigate(`/${language}/person/${encodeURIComponent(personId)}`)}
              language={language}
              className="w-full max-w-none"
            />
            <p className="text-xs text-stone-400 mt-3">{t.searchNote}</p>

            <div className="mt-8 rounded-2xl bg-white/6 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-300/90 mb-2">
                {t.statsTitle}
              </p>
              <p className="text-sm text-stone-300 leading-relaxed">
                {loading
                  ? t.statsLoading
                  : `${stats[0].value} ${stats[0].label}, ${stats[1].value} ${stats[1].label}, ${stats[2].value} ${stats[2].label}.`}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 md:mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
            <h2 className={`text-xl md:text-2xl text-stone-900 m-0 ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
              {t.quickTitle}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {quickLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="group rounded-[1.75rem] border border-stone-200 bg-white/85 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="inline-flex items-center justify-center rounded-2xl bg-amber-100 text-amber-900 w-11 h-11 mb-4">
                  {link.icon}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-950 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{link.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 md:mt-14">
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-5">
            {t.cards.map(card => (
              <Link
                key={card.view}
                to={viewHref(language, card.view)}
                className="group rounded-[1.75rem] border border-stone-200/90 bg-white/82 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-amber-200/90 transition-all"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h2 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-950 transition-colors">
                  {card.title}
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">{card.text}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
