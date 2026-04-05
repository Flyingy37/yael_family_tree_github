/**
 * ReportBrowser.tsx
 * Descendant Report Browser — Livnat Family Tree.
 * Upgraded visual design: rich generation legend, improved typography,
 * polished sidebar, card-style branch sections, hover actions.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportPerson {
  id: string;
  generation: number | null;
  name: string;
  isSpouse: boolean;
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  deathPlace: string | null;
  depth: number;
}

interface ReportBranch {
  id: number;
  label: string;
  persons: ReportPerson[];
}

interface ReportFamily {
  name: string;
  branches: ReportBranch[];
}

interface ReportData {
  meta: { totalPersons: number; totalBranches: number };
  families: ReportFamily[];
}

interface Props {
  lang: 'he' | 'en';
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const LABELS = {
  he: {
    title: 'ירידת הדורות',
    families: 'משפחות',
    search: 'חפש שם...',
    branches: 'ענפים',
    generations: 'דורות',
    birth: 'נ׳',
    death: 'נ׳פ',
    loading: 'טוען דו"ח...',
    error: 'שגיאה בטעינת הדו"ח',
    noResults: 'אין תוצאות',
    totalPersons: 'אנשים',
    focusTree: 'הצג בעץ',
    persons: 'אנשים',
    spouse: 'בן/בת זוג',
    legendTitle: 'מפת דורות',
    genLabels: ['אבות קדמונים', 'עידן היסטורי', 'ראשית המודרני', 'דורות מודרניים', 'דור נוכחי'],
    genRanges: ['1–3', '4–8', '9–13', '14–18', '19+'],
  },
  en: {
    title: 'Descendant Report',
    families: 'Families',
    search: 'Search name...',
    branches: 'branches',
    generations: 'gen.',
    birth: 'b.',
    death: 'd.',
    loading: 'Loading report...',
    error: 'Failed to load report',
    noResults: 'No results',
    totalPersons: 'persons',
    focusTree: 'Show in tree',
    persons: 'persons',
    spouse: 'spouse',
    legendTitle: 'Generation Map',
    genLabels: ['Ancestors', 'Historical', 'Early Modern', 'Modern', 'Living'],
    genRanges: ['1–3', '4–8', '9–13', '14–18', '19+'],
  },
} as const;

// ─── Generation palette ────────────────────────────────────────────────────────

const GEN_TIERS = [
  // [maxGen, badgeClass, dotClass, label index]
  { max: 3,  badge: 'bg-stone-800 text-stone-100',        dot: 'bg-stone-700',    idx: 0 },
  { max: 8,  badge: 'bg-amber-800 text-amber-50',         dot: 'bg-amber-700',    idx: 1 },
  { max: 13, badge: 'bg-amber-500 text-white',            dot: 'bg-amber-400',    idx: 2 },
  { max: 18, badge: 'bg-teal-700 text-white',             dot: 'bg-teal-600',     idx: 3 },
  { max: Infinity, badge: 'bg-indigo-600 text-white',     dot: 'bg-indigo-500',   idx: 4 },
] as const;

function getTier(gen: number | null) {
  if (gen === null) return { badge: 'bg-stone-300 text-stone-600', dot: 'bg-stone-300', idx: -1 };
  return GEN_TIERS.find(t => gen <= t.max) ?? GEN_TIERS[GEN_TIERS.length - 1];
}

// ─── Generation Legend ────────────────────────────────────────────────────────

function GenLegend({ lbl }: { lbl: (typeof LABELS)['en' | 'he'] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2 bg-white border-b border-stone-100">
      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mr-1 shrink-0">
        {lbl.legendTitle}
      </span>
      {GEN_TIERS.map((tier, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={`inline-flex items-center justify-center w-6 h-4 rounded text-[9px] font-bold ${tier.badge}`}>
            {lbl.genRanges[i]}
          </span>
          <span className="text-[10px] text-stone-500">{lbl.genLabels[i]}</span>
        </span>
      ))}
    </div>
  );
}

// ─── PersonRow ────────────────────────────────────────────────────────────────

function PersonRow({
  person,
  lbl,
  highlight,
}: {
  person: ReportPerson;
  lbl: (typeof LABELS)['en' | 'he'];
  highlight: string;
}) {
  const handleFocus = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('familyTreeFocus', { detail: { personId: person.name } })
    );
  }, [person.name]);

  const tier = getTier(person.generation);
  const isSpouse = person.isSpouse;

  // Highlight matched text
  const displayName = useMemo(() => {
    if (!highlight) return <>{person.name}</>;
    const idx = person.name.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return <>{person.name}</>;
    return (
      <>
        {person.name.slice(0, idx)}
        <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5">
          {person.name.slice(idx, idx + highlight.length)}
        </mark>
        {person.name.slice(idx + highlight.length)}
      </>
    );
  }, [person.name, highlight]);

  return (
    <div
      className={`group flex items-center gap-2 py-1 px-2 rounded-md transition-colors hover:bg-amber-50 ${
        isSpouse ? 'ms-6 opacity-80' : ''
      }`}
    >
      {/* Connector line for spouse */}
      {isSpouse && (
        <span className="shrink-0 text-stone-300 text-xs select-none">⚭</span>
      )}

      {/* Generation badge */}
      {!isSpouse && (
        <span
          className={`shrink-0 inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold tracking-tight ${tier.badge}`}
          title={`${lbl.generations} ${person.generation ?? '?'}`}
        >
          {person.generation ?? '?'}
        </span>
      )}

      {/* Dot for spouse */}
      {isSpouse && (
        <span className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${tier.dot}`} />
      )}

      {/* Name + dates */}
      <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2">
        <span className={`text-sm leading-snug font-medium ${isSpouse ? 'text-stone-600' : 'text-stone-800'}`}>
          {displayName}
        </span>
        <span className="text-[11px] text-stone-400 whitespace-nowrap">
          {person.birthDate && `${lbl.birth} ${person.birthDate}`}
          {person.birthPlace && ` · ${person.birthPlace}`}
          {person.deathDate && `  ${lbl.death} ${person.deathDate}`}
        </span>
      </div>

      {/* Focus button — visible on hover */}
      <button
        onClick={handleFocus}
        title={lbl.focusTree}
        aria-label={lbl.focusTree}
        className="shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 transition-all"
      >
        🌳
      </button>
    </div>
  );
}

// ─── BranchSection ────────────────────────────────────────────────────────────

function BranchSection({
  branch,
  defaultOpen,
  searchQuery,
  lbl,
}: {
  branch: ReportBranch;
  defaultOpen: boolean;
  searchQuery: string;
  lbl: (typeof LABELS)['en' | 'he'];
}) {
  const [open, setOpen] = useState(defaultOpen);

  const filteredPersons = useMemo(() => {
    if (!searchQuery) return branch.persons;
    const q = searchQuery.toLowerCase();
    return branch.persons.filter(p => p.name.toLowerCase().includes(q));
  }, [branch.persons, searchQuery]);

  useEffect(() => {
    if (searchQuery && filteredPersons.length > 0) setOpen(true);
  }, [searchQuery, filteredPersons.length]);

  if (searchQuery && filteredPersons.length === 0) return null;

  const maxGen = branch.persons.reduce(
    (m, p) => (p.generation !== null ? Math.max(m, p.generation) : m),
    0
  );

  const personCount = filteredPersons.filter(p => !p.isSpouse).length;

  return (
    <div className="border border-stone-200 rounded-xl mb-3 overflow-hidden shadow-sm">
      {/* Branch header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-stone-50 to-amber-50 hover:from-amber-50 hover:to-amber-100 transition-colors text-left border-b border-stone-100"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-amber-500 shrink-0" />
          <span className="font-semibold text-stone-800 text-sm">{branch.label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="bg-white border border-stone-200 rounded-full px-2 py-0.5 font-medium">
            {personCount} {lbl.persons}
          </span>
          {maxGen > 0 && (
            <span className="text-stone-400">{maxGen} {lbl.generations}</span>
          )}
          <span
            className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {/* Person list */}
      {open && (
        <div className="px-2 py-2 space-y-0.5 bg-white">
          {filteredPersons.map(person => (
            <PersonRow
              key={person.id}
              person={person}
              lbl={lbl}
              highlight={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReportBrowser ────────────────────────────────────────────────────────────

export function ReportBrowser({ lang }: Props) {
  const lbl = LABELS[lang];
  const isRtl = lang === 'he';

  const [data, setData] = useState<ReportData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}livnat-report.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ReportData>;
      })
      .then(d => {
        setData(d);
        if (d.families.length > 0) setSelectedFamily(d.families[0].name);
      })
      .catch(() => setLoadError(true));
  }, []);

  const familiesWithMatches = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data.families;
    const q = searchQuery.toLowerCase();
    return data.families.filter(fam =>
      fam.branches.some(branch =>
        branch.persons.some(p => p.name.toLowerCase().includes(q))
      )
    );
  }, [data, searchQuery]);

  useEffect(() => {
    if (searchQuery && familiesWithMatches.length > 0) {
      const stillMatches = familiesWithMatches.some(f => f.name === selectedFamily);
      if (!stillMatches) setSelectedFamily(familiesWithMatches[0].name);
    }
  }, [searchQuery, familiesWithMatches, selectedFamily]);

  const currentFamily = useMemo(
    () => (data?.families ?? []).find(f => f.name === selectedFamily) ?? null,
    [data, selectedFamily]
  );

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-red-500">
        <span className="text-3xl">⚠️</span>
        <span className="text-sm">{lbl.error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-stone-400">{lbl.loading}</span>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col h-full min-h-0 bg-stone-50">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 text-base">
            📋
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 leading-tight">{lbl.title}</h2>
            <p className="text-[11px] text-stone-400">
              {data.meta.totalPersons.toLocaleString()} {lbl.totalPersons} · {data.meta.totalBranches} {lbl.branches}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-56 shrink-0">
          <span className="absolute inset-y-0 start-3 flex items-center text-stone-400 pointer-events-none text-sm">
            🔍
          </span>
          <input
            type="search"
            placeholder={lbl.search}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full ps-8 pe-3 py-1.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* ── Generation legend ────────────────────────────────────────────────── */}
      <GenLegend lbl={lbl} />

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-44 shrink-0 border-e border-stone-200 overflow-y-auto bg-white">
          <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            {lbl.families}
          </div>
          <ul className="pb-4">
            {(searchQuery ? familiesWithMatches : data.families).map(fam => {
              const isSelected = fam.name === selectedFamily;
              const totalPersons = fam.branches.reduce((s, b) => s + b.persons.length, 0);
              return (
                <li key={fam.name}>
                  <button
                    onClick={() => setSelectedFamily(fam.name)}
                    className={`w-full text-start px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors border-e-2 ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-semibold border-amber-500'
                        : 'text-stone-600 hover:bg-stone-50 border-transparent'
                    }`}
                  >
                    <span className="truncate leading-tight">{fam.name}</span>
                    <span
                      className={`shrink-0 min-w-[1.5rem] h-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {totalPersons > 999 ? `${Math.round(totalPersons / 100) / 10}k` : totalPersons}
                    </span>
                  </button>
                </li>
              );
            })}
            {searchQuery && familiesWithMatches.length === 0 && (
              <li className="px-3 py-4 text-xs text-stone-400">{lbl.noResults}</li>
            )}
          </ul>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          {currentFamily ? (
            <>
              {/* Family header */}
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-stone-900">{currentFamily.name}</h3>
                <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">
                  {currentFamily.branches.length} {lbl.branches}
                </span>
              </div>

              {currentFamily.branches.map((branch, idx) => (
                <BranchSection
                  key={branch.id}
                  branch={branch}
                  defaultOpen={idx === 0}
                  searchQuery={searchQuery}
                  lbl={lbl}
                />
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-400 text-sm">
              {lbl.noResults}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ReportBrowser;
