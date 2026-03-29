import { Link, useParams } from 'react-router-dom';
import { FamilyArchiveApp } from '../familyArchive';

export default function FamilyArchivePage() {
  const { lang } = useParams<{ lang: string }>();
  const isEn = lang === 'en';
  const base = `/${isEn ? 'en' : 'he'}`;

  return (
    <div className="min-h-screen bg-stone-50" dir={isEn ? 'ltr' : 'rtl'}>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to={base} className="text-sm text-amber-900 hover:underline">
            {isEn ? 'Back to home' : 'חזרה לדף הבית'}
          </Link>
          <Link to={`${base}/tree`} className="text-sm font-medium text-stone-800 hover:text-amber-950">
            {isEn ? 'Open interactive tree' : 'כניסה לעץ האינטראקטיבי'}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <FamilyArchiveApp lang={isEn ? 'en' : 'he'} />
      </main>
    </div>
  );
}
