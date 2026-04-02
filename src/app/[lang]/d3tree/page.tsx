/**
 * /[lang]/d3tree — D3.js collapsible family tree page.
 */
import { useFamilyData } from '../../../hooks/useFamilyData';
import { useLang } from '../layout';
import FamilyD3Tree from '../../../components/FamilyD3Tree';

export default function D3TreePage() {
  const { persons, families, rootPersonId, loading, error } = useFamilyData();
  const { lang: language, t } = useLang();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <p className="text-stone-500 text-sm">
          {t('טוען את אילן היוחסין...', 'Loading family tree...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <p className="text-stone-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-stone-50 p-4">
      <h1
        className="text-lg font-medium text-stone-900 mb-3"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        {t('עץ משפחה – תצוגת D3', 'Family Tree – D3 View')}
      </h1>
      <div className="flex-1 min-h-0">
        <FamilyD3Tree
          persons={persons}
          families={families}
          rootPersonId={rootPersonId}
          language={language}
        />
      </div>
    </div>
  );
}
