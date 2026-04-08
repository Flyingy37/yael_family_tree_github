import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, MapPinned, Network, Search as SearchIcon, Sparkles } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { useFamilyData } from '../hooks/useFamilyData';
import { useUiLanguage } from '../hooks/useUiLanguage';

type Language = 'he' | 'en';

type HomeStat = {
  value: string;
  label: string;
  tone: string;
};

type ResearchPath = {
  key: string;
  title: string;
  description: string;
  items: { label: string; hint: string }[];
  href: string;
  accent: string;
  icon: ReactNode;
};

const COPY = {
  he: {
    title: 'משפחת ליבנת-זיידמן',
    subtitle: 'אינדקס חזותי למחקר משפחתי',
    lead:
      'עמוד פתיחה שמכוון את המחקר: אנשים, מקומות, דורות וסיפורים. במקום להיכנס לעומס בבת אחת, אפשר לבחור מסלול, לעקוב אחרי קשרים, ולעבור בהדרגה בין שכבות המידע.',
    about: 'אודות הפרויקט',
    ctaExplore: 'פתחו את החוקר',
    ctaAbout: 'מקורות ושיטה',
    lang: 'EN',
    introTitle: 'איך משתמשים באתר',
    introSteps: [
      'בחרו סוג חקירה: אדם, מקום, ענף או דפוס.',
      'עברו במסלול המתאים כדי להגיע לעץ, למפה או לתובנות.',
      'העמיקו לפרופילים, תתי-עצים ועמודי הסיפור.',
    ],
    searchTitle: 'חיפוש ישיר',
    searchBody:
      'אם כבר יש שם או מקום בראש, אין צורך להתחיל מההתחלה. החיפוש קופץ ישר לפרופיל המתאים.',
    searchNote: 'הקלידו לפחות 2 אותיות.',
    quickLabel: 'מסלולי חקר',
    statsTitle: 'ספירת מאגר',
    rootCta: 'התחילו מיעל',
    rootFallback: 'יעל',
    statsLabels: {
      people: 'אנשים',
      families: 'משפחות',
      places: 'מקומות',
      generations: 'דורות',
    },
    paths: [
      {
        key: 'people',
        title: 'אנשים וענפים',
        description: 'כניסה דרך קשרי משפחה, תתי-עצים והתמקדות בפרופיל מסוים.',
        items: [
          { label: 'עץ אינטראקטיבי', hint: 'הורים, ילדים ובני זוג' },
          { label: 'פרופילי אנשים', hint: 'מעבר ישיר לכל אדם' },
          { label: 'תתי-עצים', hint: 'זום לענף אחד' },
        ],
        href: 'tree',
      },
      {
        key: 'places',
        title: 'מקומות ותנועה',
        description: 'מעקב אחרי לידות, הגירות ומסלולי חיים דרך המפה וציר הזמן.',
        items: [
          { label: 'מפה משפחתית', hint: 'לידה, מגורים, הגירה' },
          { label: 'ציר זמן', hint: 'רצף דורות ואירועים' },
          { label: 'סיפורי מעבר', hint: 'תנועה בין ארצות' },
        ],
        href: 'map',
      },
      {
        key: 'patterns',
        title: 'תובנות ודפוסים',
        description: 'תצוגות סיכום, פילוחים ותמונה רחבה של המאגר.',
        items: [
          { label: 'סטטיסטיקות', hint: 'ספירה וחתכים' },
          { label: 'ארכיון נרטיבי', hint: 'סיפורים ושמות היסטוריים' },
          { label: 'מבט מחקרי', hint: 'השוואות ונקודות עניין' },
        ],
        href: 'insights',
      },
    ] as Omit<ResearchPath, 'accent' | 'icon'>[],
  },
  en: {
    title: 'Livnat-Zaidman family',
    subtitle: 'A visual index for family research',
    lead:
      'A front page designed as a research guide: people, places, generations, and stories. Instead of dropping you into all the data at once, it offers clear routes into the archive.',
    about: 'About the project',
    ctaExplore: 'Open the explorer',
    ctaAbout: 'Sources & method',
    lang: 'עב',
    introTitle: 'How to use this site',
    introSteps: [
      'Choose a research mode: person, place, branch, or pattern.',
      'Follow the matching route into the tree, map, or insights view.',
      'Drill down into profiles, subtrees, and story pages.',
    ],
    searchTitle: 'Direct search',
    searchBody:
      'If you already have a name or place in mind, skip the overview and jump directly to the right profile.',
    searchNote: 'Type at least 2 characters.',
    quickLabel: 'Research paths',
    statsTitle: 'Archive count',
    rootCta: 'Start with Yael',
    rootFallback: 'Yael',
    statsLabels: {
      people: 'People',
      families: 'Families',
      places: 'Places',
      generations: 'Generations',
    },
    paths: [
      {
        key: 'people',
        title: 'People and branches',
        description: 'Enter through family relations, subtree focus, and specific person profiles.',
        items: [
          { label: 'Interactive tree', hint: 'Parents, children, spouses' },
          { label: 'Person profiles', hint: 'Direct jump to a profile' },
          { label: 'Subtree focus', hint: 'Zoom in on one branch' },
        ],
        href: 'tree',
      },
      {
        key: 'places',
        title: 'Places and movement',
        description: 'Trace births, migration, and life routes through map and timeline views.',
        items: [
          { label: 'Family map', hint: 'Birth, residence, migration' },
          { label: 'Timeline', hint: 'Generations and events' },
          { label: 'Movement stories', hint: 'Routes between countries' },
        ],
        href: 'map',
      },
      {
        key: 'patterns',
        title: 'Patterns and insights',
        description: 'Summary views, breakdowns, and a wider analytical picture of the archive.',
        items: [
          { label: 'Statistics', hint: 'Counts and filtered views' },
          { label: 'Narrative archive', hint: 'Stories and historical names' },
          { label: 'Research lens', hint: 'Comparisons and signals' },
        ],
        href: 'insights',
      },
    ] as Omit<ResearchPath, 'accent' | 'icon'>[],
  },
} as const;

const PATH_STYLES = [
  {
    accent: 'bg-rose-100 text-rose-800 border-rose-200',
    line: 'bg-rose-300/80',
    dot: 'bg-rose-400',
    icon: <Network size={18} aria-hidden />,
  },
  {
    accent: 'bg-violet-100 text-violet-800 border-violet-200',
    line: 'bg-violet-300/80',
    dot: 'bg-violet-400',
    icon: <MapPinned size={18} aria-hidden />,
  },
  {
    accent: 'bg-lime-100 text-lime-800 border-lime-200',
    line: 'bg-lime-300/80',
    dot: 'bg-lime-400',
    icon: <Compass size={18} aria-hidden />,
  },
] as const;

function viewHref(lang: Language, view: string): string {
  if (view === 'insights') return `/${lang}/insights`;
  if (view === 'archive') return `/${lang}/archive`;
  if (view === 'tree') return `/${lang}/tree`;
  return `/${lang}/tree?view=${view}`;
}

export default function HomePage() {
  const [language, setLanguage] = useUiLanguage();
  const navigate = useNavigate();
  const { personList, families, rootPersonId, searchIndex } = useFamilyData();
  const t = COPY[language];
  const dir = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.title =
      language === 'he'
        ? 'אילן יוחסין - משפחת ליבנת-זיידמן'
        : 'Livnat-Zaidman family tree';
  }, [dir, language]);

  const stats = useMemo<HomeStat[]>(() => {
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

    const generationCount =
      Number.isFinite(minGeneration) && Number.isFinite(maxGeneration)
        ? maxGeneration - minGeneration + 1
        : 0;

    return [
      { value: personList.length.toLocaleString(), label: t.statsLabels.people, tone: 'bg-slate-100 text-slate-700 border-slate-300' },
      { value: families.size.toLocaleString(), label: t.statsLabels.families, tone: 'bg-amber-100 text-amber-800 border-amber-300' },
      { value: uniquePlaces.size.toLocaleString(), label: t.statsLabels.places, tone: 'bg-violet-100 text-violet-800 border-violet-300' },
      { value: generationCount.toLocaleString(), label: t.statsLabels.generations, tone: 'bg-lime-100 text-lime-800 border-lime-300' },
    ];
  }, [families.size, personList, t.statsLabels]);

  const paths = useMemo<ResearchPath[]>(
    () =>
      t.paths.map((path, index) => ({
        ...path,
        href: viewHref(language, path.href),
        accent: PATH_STYLES[index % PATH_STYLES.length].accent,
        icon: PATH_STYLES[index % PATH_STYLES.length].icon,
      })),
    [language, t.paths]
  );

  const rootPerson = useMemo(
    () => personList.find((person) => person.id === rootPersonId) ?? null,
    [personList, rootPersonId]
  );

  return (
    <div
      className="min-h-screen bg-[#f8f6f1] text-slate-700"
      dir={dir}
    >
      <header className="border-b border-slate-300/70 bg-[#f8f6f1]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1500px] mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-[3px] border-slate-400 flex items-center justify-center text-slate-500">
              <Network size={24} aria-hidden />
            </div>
            <div>
              <div className={`text-2xl leading-none ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
                {t.title}
              </div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400 mt-2">
                {t.subtitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/about"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t.about}
            </Link>
            <button
              type="button"
              onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs tracking-[0.18em] text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors"
            >
              {t.lang}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-5 py-8 md:py-12">
        <section className="grid xl:grid-cols-[320px_1fr] gap-8 xl:gap-12 items-start">
          <aside className="xl:sticky xl:top-28">
            <div className="pb-8 border-b border-slate-300/70">
              <h1 className={`text-[2.9rem] md:text-[4.4rem] leading-[0.92] text-slate-600 mb-4 ${language === 'he' ? 'font-display-he' : 'font-display-en'}`}>
                {t.title}
              </h1>
              <p className="text-sm leading-7 text-slate-500 max-w-sm">{t.lead}</p>
            </div>

            <div className="py-8 border-b border-slate-300/70">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-5">
                {t.introTitle}
              </div>
              <div className="space-y-5">
                {t.introSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full border-2 border-slate-400 text-slate-700 flex items-center justify-center text-xl font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-500 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-4">
                {t.searchTitle}
              </div>
              <p className="text-sm leading-6 text-slate-500 mb-4">{t.searchBody}</p>
              <SearchBar
                searchIndex={searchIndex}
                onSelect={(personId) => navigate(`/${language}/person/${encodeURIComponent(personId)}`)}
                language={language}
                className="w-full max-w-none"
              />
              <p className="text-xs text-slate-400 mt-3">{t.searchNote}</p>
            </div>
          </aside>

          <div className="space-y-12">
            <section>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-full border px-6 py-5 min-h-[132px] flex flex-col items-center justify-center text-center ${stat.tone}`}
                  >
                    <div className="text-3xl md:text-4xl font-semibold mb-1">{stat.value}</div>
                    <div className="text-xs uppercase tracking-[0.22em]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  {t.quickLabel}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={viewHref(language, 'tree')}
                    className="rounded-full border border-slate-400 px-5 py-2.5 text-sm text-slate-700 hover:bg-white transition-colors"
                  >
                    {t.ctaExplore}
                  </Link>
                  <Link
                    to={`/${language}/person/${encodeURIComponent(rootPersonId)}`}
                    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm text-slate-500 hover:bg-white transition-colors"
                  >
                    {t.rootCta} {rootPerson?.givenName || t.rootFallback}
                  </Link>
                  <Link
                    to="/about"
                    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm text-slate-500 hover:bg-white transition-colors"
                  >
                    {t.ctaAbout}
                  </Link>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {paths.map((path, index) => {
                  const style = PATH_STYLES[index % PATH_STYLES.length];
                  return (
                    <Link
                      key={path.key}
                      to={path.href}
                      className="group block"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="text-[1.85rem] md:text-[2.15rem] text-slate-500 tracking-wide mb-4">
                          {path.title}
                        </div>
                        <div className="w-px h-8 bg-slate-300 mb-3" />
                        <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${path.accent}`}>
                          {path.icon}
                        </div>
                        <p className="text-sm leading-6 text-slate-500 max-w-xs mb-6">
                          {path.description}
                        </p>

                        <div className="w-full max-w-xs">
                          {path.items.map((item, itemIndex) => (
                            <div key={item.label} className="flex flex-col items-center">
                              <div className={`w-px ${itemIndex === 0 ? 'h-4' : 'h-6'} ${style.line}`} />
                              <div className={`w-14 h-14 rounded-full border flex items-center justify-center ${path.accent}`}>
                                <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                              </div>
                              <div className="mt-2 text-sm text-slate-700">{item.label}</div>
                              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 text-center min-h-[2.4rem] mt-1">
                                {item.hint}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-slate-300/70 pt-8">
              <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <Sparkles size={16} aria-hidden />
                    <span className="text-xs uppercase tracking-[0.28em]">{t.statsTitle}</span>
                  </div>
                  <p className="text-base md:text-lg leading-8 text-slate-500 max-w-2xl">
                    {language === 'he'
                      ? 'מבנה הכניסה החדש מכוון את המבקר דרך שלוש שאלות פשוטות: את מי מחפשים, איפה המשפחה נעה, ואילו דפוסים מתגלים כשמסתכלים על כל המאגר יחד.'
                      : 'The revised entrance is built around three simple questions: who are you tracing, where did the family move, and what patterns emerge when the archive is viewed as a whole.'}
                  </p>
                </div>

                <div className="rounded-[2rem] border border-slate-300 bg-white/70 px-6 py-6">
                  <div className="flex items-center gap-3 mb-3 text-slate-500">
                    <SearchIcon size={18} aria-hidden />
                    <div className="text-sm uppercase tracking-[0.24em]">{t.searchTitle}</div>
                  </div>
                  <p className="text-sm leading-6 text-slate-500 mb-4">
                    {language === 'he'
                      ? 'אפשר להגיע ישירות לעמוד אדם, ואז לפתוח ממנו את העץ, המפה או תצוגת ענף.'
                      : 'You can jump directly to a person page and continue from there into the tree, map, or branch view.'}
                  </p>
                  <SearchBar
                    searchIndex={searchIndex}
                    onSelect={(personId) => navigate(`/${language}/person/${encodeURIComponent(personId)}`)}
                    language={language}
                    className="w-full max-w-none"
                  />
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
