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
import { PedigreeFanView } from '../../../components/PedigreeFanView';
import MemberCard from '../../../components/MemberCard';
import { PersonDetailPanel } from '../../../components/PersonDetailPanel';
import { X, Star } from 'lucide-react';
import { useLang } from '../layout';

// ── Colour palette for section accents ───────────────────────────────────────
const ACCENT = {
  amber:   { border: 'border-amber-400',   bg: 'bg-amber-50',   icon: 'text-amber-600' },
  teal:    { border: 'border-teal-400',    bg: 'bg-teal-50',    icon: 'text-teal-600'  },
  emerald: { border: 'border-emerald-400', bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  indigo:  { border: 'border-indigo-400',  bg: 'bg-indigo-50',  icon: 'text-indigo-600' },
  violet:  { border: 'border-violet-400',  bg: 'bg-violet-50',  icon: 'text-violet-600' },
  rose:    { border: 'border-rose-400',    bg: 'bg-rose-50',    icon: 'text-rose-600'   },
} as const;

// ── Section card wrapper ──────────────────────────────────────────────────────

function InsightSection({
  icon,
  title,
  subtitle,
  children,
  accent = 'amber',
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: keyof typeof ACCENT;
}) {
  const a = ACCENT[accent];
  return (
    <section className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div className={`flex items-start gap-3 px-5 py-4 border-b border-stone-100 border-s-[4px] ${a.border} ${a.bg}`}>
        <span className={`text-2xl leading-none mt-0.5 ${a.icon}`}>{icon}</span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-stone-800 leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-500 mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl ${color}`}>
      <span className="text-xl font-bold tabular-nums">{value.toLocaleString()}</span>
      <span className="text-xs mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { lang, t } = useLang();
  const { persons, families, personList, loading, error } = useFamilyData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const isHe = lang === 'he';

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

  // Quick stats
  const totalPersons = personList.length;
  const withBirthPlace = personList.filter(p => p.birthPlace).length;
  const withBirthDate  = personList.filter(p => p.birthDate).length;
  const families_count = families.size;

  // Root person for fan
  const rootPersonId = personList.find(p => p.fullName.includes('Yael'))?.id ?? personList[0]?.id ?? '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
        <span className="text-4xl animate-pulse">📊</span>
        <span className="text-sm font-medium">{t('טוען נתונים...', 'Loading data...')}</span>
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

  return (
    <div
      className="h-full overflow-auto"
      style={{ background: 'linear-gradient(160deg, #fafaf9 0%, #fef3c7 40%, #ede9fe 100%)' }}
      dir={isHe ? 'rtl' : 'ltr'}
    >
      {/* Sticky breadcrumb */}
      <div className="px-5 py-2.5 text-sm text-stone-500 flex items-center gap-1.5 border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm">
        <Link
          to={`/${lang}/tree`}
          className="hover:text-stone-800 transition-colors font-medium"
        >
          {t('עץ המשפחה', 'Family Tree')}
        </Link>
        <span className="text-stone-300">›</span>
        <span className="text-stone-800 font-semibold">
          {t('תובנות', 'Insights')}
        </span>
        <span className="ms-auto text-xs text-stone-400 tabular-nums bg-stone-100 px-2 py-0.5 rounded-full">
          {totalPersons.toLocaleString()} {t('אנשים', 'people')}
        </span>
      </div>

      <div className="max-w-5xl mx-auto py-7 px-4 space-y-6">

        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1
            className="text-3xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Noto Sans', 'Noto Sans Hebrew', system-ui, sans-serif" }}
          >
            {t('תובנות משפחתיות', 'Family Insights')}
          </h1>
          <p className="text-sm text-stone-500">
            {t('ניתוח ומחקר עץ משפחת ליבנת-זיידמן', 'Data analysis of the Livnat-Zaidman family tree')}
          </p>
        </div>

        {/* Quick-stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label={t('סה"כ אנשים', 'Total people')} value={totalPersons} color="bg-amber-100 text-amber-800" />
          <StatPill label={t('משפחות', 'Families')} value={families_count} color="bg-violet-100 text-violet-800" />
          <StatPill label={t('עם תאריך לידה', 'With birth date')} value={withBirthDate} color="bg-teal-100 text-teal-800" />
          <StatPill label={t('עם מקום לידה', 'With birth place')} value={withBirthPlace} color="bg-rose-100 text-rose-800" />
        </div>

        {/* Highlighted Members */}
        {highlightedMembers.length > 0 && (
          <InsightSection
            icon="⭐"
            title={t('חברים מודגשים', 'Highlighted Members')}
            subtitle={t('אנשים עם ביוגרפיה או מקום לידה ידוע', 'People with biography or known birth place')}
            accent="amber"
          >
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
          </InsightSection>
        )}

        {/* Ancestor Fan Chart */}
        {rootPersonId && (
          <InsightSection
            icon="🌀"
            title={t('תרשים אבות וצאצאים', 'Ancestor & Descendant Charts')}
            subtitle={t(
              'לחצי על אדם כדי למרכז את התרשים עליו',
              'Click a person to centre the chart on them'
            )}
            accent="violet"
          >
            <div style={{ height: 520 }} className="rounded-xl overflow-hidden border border-stone-100 flex flex-col">
              <PedigreeFanView
                persons={persons}
                families={families}
                rootPersonId={rootPersonId}
                onSelectPerson={setSelectedPersonId}
                language={lang}
              />
            </div>
          </InsightSection>
        )}

        {/* Statistics */}
        <InsightSection
          icon="📊"
          title={t('סטטיסטיקות', 'Statistics')}
          accent="amber"
        >
          <StatisticsView
            personList={personList}
            filteredIds={allIds}
            connectedToYaelIds={allIds}
            onSelectPerson={() => {}}
            language={lang}
          />
        </InsightSection>

        {/* Timeline */}
        <InsightSection
          icon="📅"
          title={t('ציר זמן', 'Timeline')}
          accent="teal"
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
          title={t('סיכומי תיעוד DNA', 'DNA Evidence Summaries')}
          subtitle={t(
            'סיכומים בטוחים לפרסום — ללא מזהי ערכה, ללא טבלאות סגמנטים גולמיות',
            'Public-safe summaries — no kit IDs, no raw segment tables'
          )}
          accent="emerald"
        >
          <DnaEvidenceSummaries language={lang} />
        </InsightSection>

        {/* DNA Matches */}
        <InsightSection
          icon="🧬"
          title={t('התאמות DNA — Family Finder', 'DNA Matches — Family Finder')}
          subtitle={t(
            'יעל ליבנת זיידמן — 37,327 התאמות סה"כ. מוצגות 98 הקרובות ביותר (≥85 cM)',
            'Yael Livnat Zaidman — 37,327 total matches. Showing top 98 (≥85 cM)'
          )}
          accent="indigo"
        >
          <DnaMatchesView language={lang} />
        </InsightSection>

      </div>

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
    </div>
  );
}
