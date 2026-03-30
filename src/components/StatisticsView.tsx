import { useMemo, useState } from 'react';
import type { Person } from '../types';
import { HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5 } from '../constants/narrativeHolocaustSupplement';
import { getCanonicalSurnameLabel } from '../utils/surname';
import { displayFullNameForUi, gedcomDateDisplay, relationTextForUi } from '../utils/personUiText';

interface Props {
  personList: Person[];
  filteredIds: Set<string>;
  connectedToYaelIds: Set<string>;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

type MetricKey =
  | 'total'
  | 'connected'
  | 'holocaustVictims'
  | 'warCasualties'
  | 'migration'
  | 'jewishLineage'
  | 'withDna'
  | 'withCoordinates'
  | 'doubleBloodTie'
  | 'female'
  | 'male'
  | 'unknownSex';

const METRIC_LABELS_EN: Record<MetricKey, string> = {
  total: 'Currently shown',
  connected: 'Connected to Yael',
  holocaustVictims: 'Holocaust victims',
  warCasualties: 'War casualties',
  migration: 'Migration data',
  jewishLineage: 'Jewish lineage',
  withDna: 'Verified DNA links',
  withCoordinates: 'Coordinates',
  doubleBloodTie: 'Double blood ties',
  female: 'Female',
  male: 'Male',
  unknownSex: 'Unknown',
};
const METRIC_LABELS_HE: Record<MetricKey, string> = {
  total: 'מוצגים כעת',
  connected: 'מחוברים ליעל',
  holocaustVictims: 'קורבנות שואה',
  warCasualties: 'נפגעי מלחמה',
  migration: 'מידע הגירה',
  jewishLineage: 'ייחוס יהודי',
  withDna: 'קשרי DNA מאומתים',
  withCoordinates: 'קואורדינטות',
  doubleBloodTie: 'קשרי דם כפולים',
  female: 'נקבה',
  male: 'זכר',
  unknownSex: 'לא ידוע',
};

function pct(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function topCounts(values: string[], limit: number): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function StatisticsView({ personList, filteredIds, connectedToYaelIds, onSelectPerson, language = 'en' }: Props) {
  const t = language === 'he';
  const uiLang = t ? 'he' : 'en';
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('holocaustVictims');
  const metricLabel = t ? METRIC_LABELS_HE[selectedMetric] : METRIC_LABELS_EN[selectedMetric];

  const filteredPersons = useMemo(
    () => personList.filter(person => filteredIds.has(person.id)),
    [personList, filteredIds]
  );

  const stats = useMemo(() => {
    const source = filteredPersons;
    const total = source.length;

    const male = source.filter(p => p.sex === 'M').length;
    const female = source.filter(p => p.sex === 'F').length;
    const unknownSex = source.filter(p => p.sex === 'U').length;
    const holocaustVictims = source.filter(p => p.holocaustVictim).length;
    const warCasualties = source.filter(p => p.warCasualty).length;
    const migration = source.filter(p => !!p.migrationInfo).length;
    const jewishLineage = source.filter(p => !!p.jewishLineage).length;
    const withCoordinates = source.filter(p => !!p.coordinates).length;
    const doubleBloodTie = source.filter(p => p.doubleBloodTie).length;
    const withDna = source.filter(p => p.tags.includes('DNA')).length;
    const connected = source.filter(p => connectedToYaelIds.has(p.id)).length;

    const tagValues = source.flatMap(p => p.tags || []);
    const topTags = topCounts(tagValues, 12);
    const topSurnames = topCounts(
      source.map(p => getCanonicalSurnameLabel(p.surnameFinal || p.surname || '')),
      12
    );
    const topBirthPlaces = topCounts(source.map(p => p.birthPlace || ''), 10);

    const generationBuckets = topCounts(
      source
        .filter(p => p.generation !== null)
        .map(p => String(p.generation)),
      20
    ).sort((a, b) => Number(a.label) - Number(b.label));

    const holocaustVictimsWithNarrativeSupplement =
      holocaustVictims + HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5;

    return {
      total,
      male,
      female,
      unknownSex,
      holocaustVictims,
      holocaustVictimsWithNarrativeSupplement,
      warCasualties,
      migration,
      jewishLineage,
      withCoordinates,
      doubleBloodTie,
      withDna,
      connected,
      topTags,
      topSurnames,
      topBirthPlaces,
      generationBuckets,
    };
  }, [filteredPersons, connectedToYaelIds]);

  const totalConnectedAll = connectedToYaelIds.size;
  const selectedSubset = useMemo(() => {
    const predicates: Record<MetricKey, (person: Person) => boolean> = {
      total: () => true,
      connected: person => connectedToYaelIds.has(person.id),
      holocaustVictims: person => person.holocaustVictim,
      warCasualties: person => person.warCasualty,
      migration: person => !!person.migrationInfo,
      jewishLineage: person => !!person.jewishLineage,
      withDna: person => person.tags.includes('DNA'),
      withCoordinates: person => !!person.coordinates,
      doubleBloodTie: person => person.doubleBloodTie,
      female: person => person.sex === 'F',
      male: person => person.sex === 'M',
      unknownSex: person => person.sex === 'U',
    };
    return filteredPersons.filter(predicates[selectedMetric]);
  }, [filteredPersons, selectedMetric, connectedToYaelIds]);

  const selectedByGeneration = useMemo(() => {
    return topCounts(
      selectedSubset
        .filter(person => person.generation !== null)
        .map(person => String(person.generation)),
      30
    ).sort((a, b) => Number(a.label) - Number(b.label));
  }, [selectedSubset]);

  const maxGenerationCount = useMemo(
    () => selectedByGeneration.reduce((max, item) => Math.max(max, item.count), 0),
    [selectedByGeneration]
  );
  const selectedPeoplePreview = useMemo(() => {
    return [...selectedSubset]
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
      .slice(0, 200);
  }, [selectedSubset]);

  return (
    <div className="h-full overflow-y-auto bg-stone-100/80 p-4 md:p-6" dir={t ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="border-b border-stone-200/90 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
            {t ? 'לוח בקרת מחקר' : 'Research dashboard'}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
            {t ? 'סטטיסטיקות והיקף נתונים' : 'Family statistics and data scope'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
            {t
              ? 'בחרי מדד כדי לראות התפלגות דורית ורשימת רשומות. המספרים משקפים את טווח הסינון הנוכחי בעץ.'
              : 'Pick a metric to see generation distribution and a scannable record list. Counts reflect your current tree filter scope.'}
          </p>
        </header>

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm md:p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500">
            {t ? 'מדדי אוכלוסייה' : 'Population metrics'}
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <button
              type="button"
              onClick={() => setSelectedMetric('total')}
              className={`rounded-lg border p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${
                selectedMetric === 'total'
                  ? 'border-sky-300 bg-sky-50/90 shadow-[inset_3px_0_0_0_#0284c7]'
                  : 'border-stone-200/90 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                {t ? 'מוצגים כעת' : 'Currently shown'}
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-sky-800">{stats.total.toLocaleString()}</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('connected')}
              className={`rounded-lg border p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${
                selectedMetric === 'connected'
                  ? 'border-emerald-300 bg-emerald-50/90 shadow-[inset_3px_0_0_0_#059669]'
                  : 'border-stone-200/90 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                {t ? 'מחוברים ליעל' : 'Connected to Yael'}
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-800">
                {stats.connected.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-stone-500">
                {pct(stats.connected, stats.total)} · {t ? 'בקובץ' : 'in file'}: {totalConnectedAll.toLocaleString()}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('holocaustVictims')}
              className={`rounded-lg border p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${
                selectedMetric === 'holocaustVictims'
                  ? 'border-rose-300 bg-rose-50/90 shadow-[inset_3px_0_0_0_#e11d48]'
                  : 'border-stone-200/90 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                {t ? 'קורבנות שואה' : 'Holocaust victims'}
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-rose-900">
                {stats.holocaustVictimsWithNarrativeSupplement.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-stone-500">
                {pct(stats.holocaustVictims, stats.total)}
                {HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5 > 0 ? (
                  <span className="mt-1 block text-rose-700/90">
                    {t
                      ? `בגרף: ${stats.holocaustVictims.toLocaleString()} · +${HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5} במסמך חלק 5`
                      : `In graph: ${stats.holocaustVictims.toLocaleString()} · +${HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5} Part 5 doc`}
                  </span>
                ) : null}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('warCasualties')}
              className={`rounded-lg border p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${
                selectedMetric === 'warCasualties'
                  ? 'border-violet-300 bg-violet-50/90 shadow-[inset_3px_0_0_0_#7c3aed]'
                  : 'border-stone-200/90 bg-stone-50/50 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                {t ? 'נפגעי מלחמה' : 'War casualties'}
              </div>
              <div className="mt-1 font-mono text-xl font-bold tabular-nums text-violet-900">
                {stats.warCasualties.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-stone-500">{pct(stats.warCasualties, stats.total)}</div>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">
                {metricLabel}
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                {t
                  ? `${selectedSubset.length.toLocaleString()} רשומות בטווח המדד`
                  : `${selectedSubset.length.toLocaleString()} records in this metric`}
              </p>
            </div>
            <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-[11px] font-medium text-stone-600">
              {t ? 'לפי דור' : 'By generation'}
            </span>
          </div>
          <div className="space-y-2.5">
            {selectedByGeneration.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
                {t ? 'אין התפלגות דורית למדד הזה.' : 'No generation distribution for this metric.'}
              </div>
            )}
            {selectedByGeneration.map(item => {
              const widthPercent =
                maxGenerationCount === 0 ? 0 : Math.round((item.count / maxGenerationCount) * 100);
              return (
                <div
                  key={item.label}
                  className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-xs md:grid-cols-[5rem_1fr_3.5rem]"
                >
                  <div className="font-mono text-[11px] font-semibold tabular-nums text-stone-600">
                    {t ? `דור ${item.label}` : `G${item.label}`}
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-sky-600 to-sky-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <div className="text-end font-mono text-[11px] font-semibold tabular-nums text-stone-800">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{t ? 'כיסוי נתונים' : 'Data coverage'}</h3>
            <div className="space-y-1 text-sm">
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('migration')}><span>{t ? 'מידע הגירה' : 'Migration data'}</span><span>{stats.migration} ({pct(stats.migration, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('jewishLineage')}><span>{t ? 'ייחוס יהודי' : 'Jewish lineage'}</span><span>{stats.jewishLineage} ({pct(stats.jewishLineage, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('withDna')}><span>{t ? 'קשרי DNA מאומתים' : 'Verified DNA links'}</span><span>{stats.withDna} ({pct(stats.withDna, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('withCoordinates')}><span>{t ? 'קואורדינטות' : 'Coordinates'}</span><span>{stats.withCoordinates} ({pct(stats.withCoordinates, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('doubleBloodTie')}><span>{t ? 'קשרי דם כפולים' : 'Double blood ties'}</span><span>{stats.doubleBloodTie} ({pct(stats.doubleBloodTie, stats.total)})</span></button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{t ? 'התפלגות מין' : 'Sex distribution'}</h3>
            <div className="space-y-1 text-sm">
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('female')}><span>{t ? 'נקבה' : 'Female'}</span><span>{stats.female} ({pct(stats.female, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('male')}><span>{t ? 'זכר' : 'Male'}</span><span>{stats.male} ({pct(stats.male, stats.total)})</span></button>
              <button className="w-full flex justify-between hover:bg-gray-50 rounded px-1" onClick={() => setSelectedMetric('unknownSex')}><span>{t ? 'לא ידוע' : 'Unknown'}</span><span>{stats.unknownSex} ({pct(stats.unknownSex, stats.total)})</span></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{t ? 'תגיות מובילות' : 'Top tags'}</h3>
            <div className="space-y-1 text-sm max-h-72 overflow-y-auto">
              {stats.topTags.length === 0 && <div className="text-gray-400">{t ? 'אין נתונים' : 'No data'}</div>}
              {stats.topTags.map(item => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{t ? 'שמות משפחה מובילים' : 'Top surnames'}</h3>
            <div className="space-y-1 text-sm max-h-72 overflow-y-auto">
              {stats.topSurnames.length === 0 && <div className="text-gray-400">{t ? 'אין נתונים' : 'No data'}</div>}
              {stats.topSurnames.map(item => (
                <div key={item.label} className="flex justify-between">
                  <span>{item.label}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{t ? 'מקומות לידה נפוצים' : 'Common birth places'}</h3>
            <div className="space-y-1 text-sm max-h-72 overflow-y-auto">
              {stats.topBirthPlaces.length === 0 && <div className="text-gray-400">{t ? 'אין נתונים' : 'No data'}</div>}
              {stats.topBirthPlaces.map(item => (
                <div key={item.label} className="flex justify-between gap-2">
                  <span className="truncate" title={item.label}>{item.label}</span>
                  <span className="text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-1">
            {t ? 'אנשים במדד הנבחר' : 'People in selected metric'}
          </h3>
          {selectedMetric === 'holocaustVictims' && HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5 > 0 ? (
            <div className="mb-3 text-xs rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
              {t
                ? `הרשימה למטה היא רק אנשים בגרף. עוד ${HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5} קורבנות מתועדים במסמך חלק 5 (קרקס: ד"ר בוריס, סוניה, דוד) – ראו ארכיון משפחתי.`
                : `The list below is graph persons only. ${HOLOCAUST_NARRATIVE_SUPPLEMENT_KRAKES_PART5} more victims are documented in Part 5 (Krakes: Dr. Boris, Sonia, David) — see the family narrative archive.`}
            </div>
          ) : null}
          <div className="text-xs text-gray-500 mb-3">
            {t
              ? `לחיצה על אדם תפתח פרטים. מוצגים עד ${selectedPeoplePreview.length.toLocaleString()} אנשים.`
              : `Click a person to open details. Showing up to ${selectedPeoplePreview.length.toLocaleString()} people.`}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {selectedPeoplePreview.length === 0 && (
              <div className="text-sm text-gray-400 py-2">{t ? 'אין אנשים בקבוצה הזו.' : 'No people in this group.'}</div>
            )}
            {selectedPeoplePreview.map(person => (
              <button
                key={person.id}
                className="w-full py-2 text-left hover:bg-gray-50 px-1 transition-colors"
                onClick={() => onSelectPerson(person.id)}
              >
                <div className="text-sm font-medium text-gray-800">
                  {displayFullNameForUi(person, uiLang)}
                </div>
                <div className="text-xs text-gray-500">
                  {relationTextForUi(person, uiLang) || (t ? 'ללא טקסט קרבה' : 'No relation text')}
                  {gedcomDateDisplay(person.birthDate) ? ` | ${gedcomDateDisplay(person.birthDate)}` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-2">{t ? 'התפלגות לפי דור' : 'Generation distribution'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {stats.generationBuckets.length === 0 && <div className="text-gray-400">{t ? 'אין נתונים' : 'No data'}</div>}
            {stats.generationBuckets.map(item => (
              <div key={item.label} className="p-2 rounded border border-gray-200 bg-gray-50">
                <div className="text-gray-500">{t ? `דור ${item.label}` : `Gen ${item.label}`}</div>
                <div className="font-semibold text-gray-800">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
