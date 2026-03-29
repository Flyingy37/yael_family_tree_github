/**
 * /[lang]/insights — family analytics & statistics standalone page.
 */
import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFamilyData } from '../../../hooks/useFamilyData';
import { StatisticsView } from '../../../components/StatisticsView';
import { TimelineView } from '../../../components/TimelineView';
import { useLang } from '../layout';

export default function InsightsPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { persons, personList, loading, error } = useFamilyData();

  const handleSelectPerson = useCallback(
    (id: string) => {
      navigate(`/${lang}/person/${encodeURIComponent(id)}`);
    },
    [navigate, lang]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t('טוען נתונים...', 'Loading data...')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-600">{t('שגיאה בטעינת הנתונים', 'Error loading data')}</p>
        <Link to={`/${lang}/tree`} className="text-blue-600 underline">
          {t('חזור לעץ', 'Back to tree')}
        </Link>
      </div>
    );
  }

  const allIds = new Set(persons.keys());

  // Simple connected-to-root set for StatisticsView (all persons)
  const connectedIds = allIds;

  return (
    <div
      className="h-full overflow-auto bg-gray-50"
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-1 border-b bg-white sticky top-0 z-10">
        <Link to={`/${lang}/tree`} className="hover:text-gray-800 transition-colors">
          {t('עץ המשפחה', 'Family Tree')}
        </Link>
        <span className="mx-1">›</span>
        <span className="text-gray-800 font-medium">
          {t('תובנות', 'Insights')}
        </span>
        <span className="ms-auto text-xs text-gray-400">
          {personList.length.toLocaleString()} {t('אנשים', 'people')}
        </span>
      </div>

      <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('📊 תובנות משפחתיות', '📊 Family Insights')}
        </h1>

        {/* Statistics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {t('סטטיסטיקות', 'Statistics')}
          </h2>
          <StatisticsView
            personList={personList}
            filteredIds={allIds}
            connectedToYaelIds={connectedIds}
            onSelectPerson={handleSelectPerson}
            language={lang}
          />
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {t('ציר זמן', 'Timeline')}
          </h2>
          <div className="h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-white">
            <TimelineView
              persons={persons}
              filteredIds={allIds}
              onSelectPerson={handleSelectPerson}
              language={lang}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
