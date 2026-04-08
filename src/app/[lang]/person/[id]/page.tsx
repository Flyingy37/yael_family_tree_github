/**
 * /[lang]/person/[id] — standalone person detail page.
 * Shareable URL for any person in the family tree.
 */
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFamilyData } from '../../../../hooks/useFamilyData';
import { PersonDetailPanel } from '../../../../components/PersonDetailPanel';
import { DEFAULT_FILTERS } from '../../../../components/FilterPanel';
import { useLang } from '../../layout';
import { getCanonicalGinzburgLiandresDisplayName, isGinzburgLiandresBranchPerson } from '../../../../branches/ginzburgLiandres';

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { persons, families, rootPersonId, loading, error } = useFamilyData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        {t('טוען...', 'Loading...')}
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-600">{t('שגיאה בטעינת הנתונים', 'Error loading data')}</p>
        <Link to={`/${lang}/tree`} className="text-blue-600 underline">
          {t('חזור לעץ', 'Back to tree')}
        </Link>
      </div>
    );
  }

  const decodedId = decodeURIComponent(id);
  const person = persons.get(decodedId);
  const isBranchMember = !!(person && isGinzburgLiandresBranchPerson(person));

  const displayName = person && isBranchMember
    ? getCanonicalGinzburgLiandresDisplayName(person)
    : person?.fullName;

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-600">{t('אדם לא נמצא', 'Person not found')}</p>
        <Link to={`/${lang}/tree`} className="text-blue-600 underline">
          {t('חזור לעץ', 'Back to tree')}
        </Link>
      </div>
    );
  }

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
        <span className="text-gray-800 font-medium">{displayName}</span>
        <button
          className="ms-auto text-xs text-blue-600 hover:underline"
          onClick={() => navigate(`/${lang}/tree?focus=${encodeURIComponent(decodedId)}`)}
        >
          {t('הצג בעץ', 'Show in tree')}
        </button>
      </div>

      {/* Person detail */}
      <div className="max-w-2xl mx-auto py-6 px-4">
        {isBranchMember && (
          <div className="atlas-card mb-4 rounded-2xl px-4 py-3">
            <div className="atlas-kicker">
              Branch package
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-sm text-[var(--atlas-text)]">
                Ginzburg-Liandres
              </div>
              <Link
                to={`/${lang}/branches/ginzburg-liandres`}
                className="atlas-link text-xs"
              >
                Open branch page
              </Link>
            </div>
          </div>
        )}
        <PersonDetailPanel
          person={person}
          persons={persons}
          families={families}
          rootPersonId={rootPersonId}
          activeFilters={DEFAULT_FILTERS}
          isConnectedToYael={true}
          onNavigate={(newId) => navigate(`/${lang}/person/${encodeURIComponent(newId)}`)}
          onClose={() => navigate(`/${lang}/tree`)}
          onShowSubtree={(subtreeId) => navigate(`/${lang}/tree?focus=${encodeURIComponent(subtreeId)}`)}
          language={lang}
        />
      </div>
    </div>
  );
}
