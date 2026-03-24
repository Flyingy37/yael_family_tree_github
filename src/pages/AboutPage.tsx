import { Link } from 'react-router-dom';
import { useUiLanguage } from '../hooks/useUiLanguage';

const COPY = {
  he: {
    back: 'חזרה לדף הבית',
    explore: 'כניסה לחקר',
    title: 'אודות הפרויקט',
    sections: [
      {
        h: 'מה זה האתר',
        p:
          'פרויקט משפחתי פרטי לאיסוף, ארגון והצגה של אילן יוחסין. המטרה היא חוויית גילוי — עץ, מפה וציר זמן — ולא רק טבלת נתונים.',
      },
      {
        h: 'מקורות ורמת ודאות',
        p:
          'חלק מהמידע מבוסס על מסמכים ועצים גנאלוגיים; חלק על העתקות משניים, השערות או מסורת משפחתית. ייתכנו תיקונים עתידיים. כדאי לבדוק כל עובדה חשובה מול מקור ראשוני כשאפשר.',
      },
      {
        h: 'פרטיות',
        p:
          'מידע על אנשים חיים, קטינים ונתוני DNA רגישים — אינם מיועדים לפרסום ציבורי. אם האתר או הריפו פרטיים, שמרו על כך גם בשיתוף קישורים.',
      },
    ],
    footer: 'עודכן כחלק מהמעבר לחוויית בית ואודות.',
  },
  en: {
    back: 'Back to home',
    explore: 'Open explorer',
    title: 'About this project',
    sections: [
      {
        h: 'What this site is',
        p:
          'A private family project to organize and explore a family tree. The goal is discovery — tree, map, and timeline — not a raw spreadsheet experience.',
      },
      {
        h: 'Sources & certainty',
        p:
          'Some facts come from documents and genealogical trees; some from secondary copies, inference, or family tradition. Important claims should be verified against primary sources when possible.',
      },
      {
        h: 'Privacy',
        p:
          'Information about living people, minors, and sensitive DNA data is not meant for public sharing. Keep that in mind when sharing links even from a private deployment.',
      },
    ],
    footer: 'Updated as part of the home + about experience.',
  },
} as const;

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
              to="/explore/tree"
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
        <h1 className="text-2xl font-bold text-stone-900 mb-8">{t.title}</h1>
        <div className="space-y-8">
          {t.sections.map(s => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-stone-800 mb-2">{s.h}</h2>
              <p className="text-stone-600 leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-stone-400">{t.footer}</p>
      </main>
    </div>
  );
}
