import { Link } from 'react-router-dom';
import { useUiLanguage } from '../hooks/useUiLanguage';

type Section = {
  h: string;
  p?: string;
  items?: string[];
};

const COPY = {
  he: {
    back: 'חזרה לדף הבית',
    explore: 'כניסה לחקר',
    title: 'אודות הפרויקט',
    lead:
      'אתר מחקר משפחתי סביב אילן היוחסין של משפחת ליבנת-זיידמן. המטרה היא לחבר בין אנשים, מקומות ודורות - בצורה נוחה לעין ולמחקר, לא רק כטבלה.',
    sections: [
      {
        h: 'מה אפשר לעשות כאן',
        items: [
          'עץ אינטראקטיבי - הורים, ילדים ובני זוג, עם אפשרות להתמקד בתת־עץ של אדם מסוים.',
          'מפת עולם - מיקומים ידועים (לידה, מגורים, הגירה) כשהנתונים קיימים.',
          'ציר זמן - לידות, פטירות ואירועים לפי תקופות.',
          'סטטיסטיקות וסינונים - דורות, שם משפחה, תגיות מחקר, מרחק קרבה מיעל, ועוד (בעמוד "תובנות").',
          'ארכיון נרטיבי - סיפורים, מכתבים וחיפוש חכם לפי כינויים היסטוריים של שמות.',
          'חיפוש חכם - לפי שם, מקום או טקסטים נלווים (כולל תמיכה בעברית ובלועזית).',
        ],
      },
      {
        h: 'איך הנתונים בנויים',
        p:
          'הנתונים מגיעים מקובצי CSV מקומיים (למשל `canonical.csv` ו־`curated.csv`), מעובדים בסקריפט בנייה לקובץ גרף אחד (`family-graph.json`) שנטען באפליקציה. פורמט העמודות וכללי עבודה מתועדים ב־`data/data_dictionary.md` בריפו - שימושי למי שמעדכן או בונה את האתר מחדש.',
      },
      {
        h: 'מקורות ורמת ודאות',
        p:
          'חלק מהעובדות מבוססות על מסמכים, רישומים ואילנות גנאלוגיים מאומתים; חלק על העתקות משניות, השערות או מסורת בעל־פה. העץ משתנה עם גילוי מידע חדש - מומלץ לבדוק טענות חשובות מול מקור ראשוני כשאפשר, ולתעד מקורות בעת הוספת פרטים.',
      },
      {
        h: 'פרטיות ואחריות',
        p:
          'מידע על אנשים חיים, קטינים ונתוני DNA רגישים אינו מיועד לפרסום ציבורי. גם בפריסה פרטית - שיתוף קישורים או צילומי מסך עלול לחשוף פרטים; יש לשקול מראש מי הקהל ומה מוצג. אם האתר מופיע ברשת, כדאי לעיין ב־`data_dictionary.md` ובמדיניות הגישה שלכם.',
      },
      {
        h: 'כתובות וניווט',
        p:
          'האפליקציה עובדת עם קידומת שפה: `/he/...` או `/en/...`. עץ, מפה, ציר זמן ותצוגת סטטיסטיקה בתוך החוקר נמצאים ב־`/:lang/tree` (מעבר בין תצוגות עם `?view=map`, `timeline`, `stats`). תובנות: `/:lang/insights`. ארכיון נרטיבי: `/:lang/archive`. פרופיל אדם: `/:lang/person/:id`. נתיבי `/explore/...` ישנים מפנים אוטומטית.',
      },
      {
        h: 'טכנולוגיה (בקצרה)',
        p:
          'הממשק בנוי ב־React ו־TypeScript (Vite), עם React Flow לעץ, Leaflet למפה, ו־Fuse.js לחיפוש. העיצוב תומך ב־RTL לעברית.',
      },
    ] satisfies Section[],
    footer: 'פרויקט משפחתי - לשאלות ותיקונים, עדכנו את מנהלי המאגר או את עורכי העץ.',
  },
  en: {
    back: 'Back to home',
    explore: 'Open explorer',
    title: 'About this project',
    lead:
      'A family research site centered on the Livnat–Zaidman family tree. It connects people, places, and generations in a clear, explorable way - not as a wall of spreadsheet rows.',
    sections: [
      {
        h: 'What you can do here',
        items: [
          'Interactive tree - parents, children, and spouses, with optional focus on one person’s subtree.',
          'World map - known locations (birth, residence, migration) when coordinates exist.',
          'Timeline - births, deaths, and events by period.',
          'Statistics & filters - generations, surnames, research tags, kinship distance from Yael, and more (Insights page).',
          'Narrative archive - stories, letters, and smart search across historical name variants.',
          'Smart search - names, places, and related text (Hebrew and Latin-friendly).',
        ],
      },
      {
        h: 'How the data is built',
        p:
          'Data lives in local CSV files (e.g. `canonical.csv` and `curated.csv`), processed by a build script into a single graph file (`family-graph.json`) for the app. Column definitions and editorial rules are documented in `data/data_dictionary.md` in the repository - useful for anyone updating data or rebuilding the site.',
      },
      {
        h: 'Sources & certainty',
        p:
          'Some facts come from documents, records, and vetted genealogical trees; some from secondary copies, inference, or oral tradition. The tree evolves as new evidence appears - verify important claims against primary sources when you can, and cite sources when adding details.',
      },
      {
        h: 'Privacy & responsibility',
        p:
          'Information about living people, minors, and sensitive DNA data is not intended for public distribution. Even on a private deployment, sharing links or screenshots can expose details - consider audience and what is visible. If the site is online, review `data_dictionary.md` and your own access policy.',
      },
      {
        h: 'URLs & navigation',
        p:
          'The app uses a language prefix: `/he/...` or `/en/...`. Tree, map, timeline, and in-explorer stats live at `/:lang/tree` (switch views with `?view=map`, `timeline`, or `stats`). Insights: `/:lang/insights`. Narrative archive: `/:lang/archive`. Person profile: `/:lang/person/:id`. Legacy `/explore/...` paths redirect.',
      },
      {
        h: 'Technology (briefly)',
        p:
          'The UI is React and TypeScript (Vite), with React Flow for the tree, Leaflet for maps, and Fuse.js for search. Layout supports RTL for Hebrew.',
      },
    ] satisfies Section[],
    footer: 'A family project - for corrections or questions, contact the repository maintainers or tree editors.',
  },
} as const;

function SectionBlock({ section }: { section: Section }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-800 mb-3">{section.h}</h2>
      {section.p && <p className="text-stone-600 leading-relaxed">{section.p}</p>}
      {section.items && (
        <ul className="text-stone-600 leading-relaxed space-y-2 list-disc ps-5">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AboutPage() {
  const [language, setLanguage] = useUiLanguage();
  const t = COPY[language];
  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-stone-50" dir={dir}>
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <Link to="/" className="text-sm text-amber-900 hover:underline">
            {t.back}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to={`/${language}/tree`}
              className="text-sm font-medium text-stone-800 hover:text-amber-950"
            >
              {t.explore}
            </Link>
            <button
              type="button"
              onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
              className="text-xs px-2 py-1 rounded border border-stone-300"
            >
              {language === 'he' ? 'EN' : 'עב'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">{t.title}</h1>
        <p className="text-stone-700 leading-relaxed text-lg mb-10 border-s-4 border-amber-200 ps-4">
          {t.lead}
        </p>
        <div className="space-y-10">
          {t.sections.map(s => (
            <SectionBlock key={s.h} section={s} />
          ))}
        </div>
        <p className="mt-14 text-sm text-stone-500 leading-relaxed max-w-2xl">{t.footer}</p>
      </main>
    </div>
  );
}
