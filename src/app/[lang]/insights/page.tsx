/**
 * /[lang]/insights — family analytics & statistics standalone page.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFamilyData } from '../../../hooks/useFamilyData';
import { StatisticsView } from '../../../components/StatisticsView';
import { TimelineView } from '../../../components/TimelineView';
import { DnaMatchesView } from '../../../components/DnaMatchesView';
import { DnaEvidenceSummaries } from '../../../components/DnaEvidenceSummaries';
import MemberCard from '../../../components/MemberCard';
import { PersonDetailPanel } from '../../../components/PersonDetailPanel';
import { X, Star } from 'lucide-react';
import { useLang } from '../layout';

// ── Section card wrapper ──────────────────────────────────────────────────────

function InsightSection({
  icon,
  title,
  subtitle,
  children,
  accentColor = 'border-amber-400',
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <section className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div className={`flex items-start gap-3 px-5 py-4 border-b border-stone-100 border-s-4 ${accentColor}`}>
        <span className="text-2xl leading-none mt-0.5">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-stone-800 leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { lang, t } = useLang();
  const { persons, families, personList, loading, error } = useFamilyData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const selectedPerson = selectedPersonId ? persons.get(selectedPersonId) : null;

  const highlightedMembers = personList
    .filter(p => p.birthPlace || p.note || p.story)
    .slice(0, 6)
    .map(p => ({
      full_name: p.fullName,
      gender: p.sex as 'M' | 'F',
      birth_date: p.birthDate || undefined,
      birth_place: p.birthPlace || undefined,
      branch: p.surnameFinal || p.surname || undefined,
    }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
        <span className="text-3xl animate-pulse">📊</span>
        <span className="text-sm">{t('טוען נתונים...', 'Loading data...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-600 text-sm">{t('שגיאה בטעינת הנתונים', 'Error loading data')}</p>
        <Link to={`/${lang}/tree`} className="text-amber-700 underline text-sm hover:text-amber-900">
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
      className="h-full overflow-auto bg-stone-50"
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Sticky breadcrumb */}
      <div className="px-4 py-2 text-sm text-stone-500 flex items-center gap-1 border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <Link to={`/${lang}/tree`} className="hover:text-stone-800 transition-colors">
          {t('עץ המשפחה', 'Family Tree')}
        </Link>
        <span className="mx-1 text-stone-300">›</span>
        <span className="text-stone-800 font-medium">
          {t('תובנות', 'Insights')}
        </span>
        <span className="ms-auto text-xs text-stone-400 tabular-nums">
          {personList.length.toLocaleString()} {t('אנשים', 'people')}
        </span>
      </div>

      <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
        {/* Page title */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-stone-800">
            {t('תובנות משפחתיות', 'Family Insights')}
          </h1>
          <span className="text-sm text-stone-400 font-normal">
            {t('ניתוח הדאטה של עץ המשפחה', 'Analysis of the family tree data')}
          </span>
        </div>

        {/* Highlighted Members */}
        {highlightedMembers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {t('חברים מודגשים', 'Highlighted Members')}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {t('אנשים עם ביוגרפיה או מקום לידה', 'People with biography or birth place')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlightedMembers.map((member, idx) => (
                <MemberCard
                  key={idx}
                  member={member}
                  language={lang}
                  onFocusBranch={() => {}}
                  onOpenBio={() => {
                    const original = personList.find(p => p.fullName === member.full_name);
                    if (original) setSelectedPersonId(original.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Person Detail Modal */}
        {selectedPerson && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setSelectedPersonId(null)}
            />
            <div className="relative ms-auto h-full w-80 md:w-96 overflow-y-auto bg-white shadow-2xl">
              <button
                onClick={() => setSelectedPersonId(null)}
                className="absolute top-4 start-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors z-10"
                aria-label={t('סגור', 'Close')}
              >
                <X className="w-5 h-5" />
              </button>
              <PersonDetailPanel
                person={selectedPerson}
                persons={persons}
                families={families}
                activeFilters={{
                  generationMin: -29,
                  generationMax: 2,
                  sex: 'all',
                  surname: '',
                  connectedToYaelOnly: false,
                  hasDna: false,
                  holocaustVictimsOnly: false,
                  hasHeritageTag: false,
                  hasPartisanTag: false,
                  hasFamousTag: false,
                  hasRabbiTag: false,
                  hasLineageTag: false,
                  hasMigrationTag: false,
                  hasDoubleBloodTieTag: false,
                  doubleBloodTieMinPaths: 3,
                  maxHops: null,
                  hideUnknownPlaceholders: true,
                }}
                isConnectedToYael={true}
                onNavigate={(id) => setSelectedPersonId(id)}
                onClose={() => setSelectedPersonId(null)}
                language={lang}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <InsightSection
          icon="📊"
          title={t('סטטיסטיקות', 'Statistics')}
          accentColor="border-s-amber-500"
        >
          <StatisticsView
            personList={personList}
            filteredIds={allIds}
            connectedToYaelIds={connectedIds}
            onSelectPerson={() => {}}
            language={lang}
          />
        </InsightSection>

        {/* Timeline */}
        <InsightSection
          icon="📅"
          title={t('ציר זמן', 'Timeline')}
          accentColor="border-s-teal-500"
        >
          <TimelineView
            persons={persons}
            filteredIds={allIds}
            onSelectPerson={() => {}}
            language={lang}
          />
        </InsightSection>

        {/* DNA Evidence Summaries */}
        <InsightSection
          icon="🔬"
          title={t('סיכומי ראיות DNA', 'DNA Evidence Summaries')}
          subtitle={t(
            'סיכומים בטוחים לפרסום — ללא מזהי ערכה, ללא טבלאות סגמנטים גולמיות.',
            'Public-safe summaries — no kit IDs, no raw segment tables.'
          )}
          accentColor="border-s-emerald-500"
        >
          <DnaEvidenceSummaries language={lang} />
        </InsightSection>

        {/* DNA Matches */}
        <InsightSection
          icon="🧬"
          title={t('התאמות DNA — Family Finder', 'DNA Matches — Family Finder')}
          subtitle={t(
            'יעל ליבנת זיידמן — 37,327 התאמות סה"כ. מוצגות 98 הקרובות ביותר (≥85 cM).',
            'Yael Livnat Zaidman — 37,327 total matches. Showing top 98 (≥85 cM).'
          )}
          accentColor="border-s-indigo-500"
        >
          <DnaMatchesView language={lang} />
        </InsightSection>
      </div>
    </div>
  );
}
