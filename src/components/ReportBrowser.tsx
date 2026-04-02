/**
 * ReportBrowser.tsx
 * Descendant Report Browser for the Livnat Family Tree.
 * Displays branches and persons from livnat-report.json with search,
 * collapsible branches, generation color-coding, and family tree focus.
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
    title: 'דו"ח ירידת הדורות',
    families: 'משפחות',
    search: 'חפש שם...',
    branches: 'ענפים',
    generations: 'דורות',
    birth: 'לידה',
    death: 'פטירה',
    loading: 'טוען...',
    error: 'שגיאה בטעינת הדו"ח',
    noResults: 'אין תוצאות',
    totalPersons: 'סה"כ אנשים',
    focusTree: 'הצג בעץ',
    persons: 'אנשים',
  },
  en: {
    title: 'Descendant Report',
    families: 'Families',
    search: 'Search name...',
    branches: 'branches',
    generations: 'generations',
    birth: 'b.',
    death: 'd.',
    loading: 'Loading...',
    error: 'Failed to load report',
    noResults: 'No results',
    totalPersons: 'Total persons',
    focusTree: 'Focus in tree',
    persons: 'persons',
  },
} as const;

// ─── Generation color helpers ─────────────────────────────────────────────────

function genBadgeClass(gen: number | null): string {
  if (gen === null) return 'bg-stone-400 text-white';
  if (gen <= 3) return 'bg-amber-900 text-amber-50';
  if (gen <= 8) return 'bg-amber-700 text-amber-50';
  if (gen <= 13) return 'bg-yellow-600 text-white';
  if (gen <= 18) return 'bg-green-700 text-white';
  return 'bg-blue-600 text-white';
}

// ─── PersonRow ────────────────────────────────────────────────────────────────

function PersonRow({
  person,
  lbl,
}: {
  person: ReportPerson;
  lbl: (typeof LABELS)['en' | 'he'];
}) {
  const handleFocus = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('familyTreeFocus', { detail: { personId: person.name } })
    );
  }, [person.name]);

  const indent = person.isSpouse ? 'pl-6' : '';

  return (
    <div
      className={`flex items-start gap-2 py-1 px-2 rounded hover:bg-amber-50 group transition-colors ${indent}`}
    >
      {/* Generation badge */}
      <span
        className={`shrink-0 inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold ${genBadgeClass(
          person.generation
        )} mt-0.5`}
      >
        {person.isSpouse ? '⚭' : (person.generation ?? '?')}
      </span>

      {/* Name and dates */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-stone-800 leading-snug">
          {person.name}
        </span>
        <span className="text-xs text-stone-400 ml-2">
          {person.birthDate && (
            <span>
              {lbl.birth} {person.birthDate}
              {person.birthPlace && ` · ${person.birthPlace}`}
            </span>
          )}
          {person.deathDate && (
            <span className="ml-1">
              {lbl.death} {person.deathDate}
            </span>
          )}
        </span>
      </div>

      {/* Focus button */}
      <button
        onClick={handleFocus}
        title={lbl.focusTree}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-amber-700 hover:text-amber-900 text-sm transition-opacity"
        aria-label={lbl.focusTree}
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

  // Filter persons by search query
  const filteredPersons = useMemo(() => {
    if (!searchQuery) return branch.persons;
    const q = searchQuery.toLowerCase();
    return branch.persons.filter((p) => p.name.toLowerCase().includes(q));
  }, [branch.persons, searchQuery]);

  // Auto-open when searching
  useEffect(() => {
    if (searchQuery && filteredPersons.length > 0) setOpen(true);
  }, [searchQuery, filteredPersons.length]);

  // Don't render if search active and no matches
  if (searchQuery && filteredPersons.length === 0) return null;

  const maxGen = branch.persons.reduce(
    (m, p) => (p.generation !== null ? Math.max(m, p.generation) : m),
    0
  );

  return (
    <div className="border border-stone-200 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-amber-50 transition-colors text-left"
      >
        <span className="font-semibold text-stone-700 text-sm">
          {branch.label}
        </span>
        <span className="flex items-center gap-2 text-xs text-stone-500">
          <span>{filteredPersons.length} {lbl.persons}</span>
          {maxGen > 0 && (
            <span>
              {maxGen} {lbl.generations}
            </span>
          )}
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="px-2 py-1 divide-y divide-stone-100">
          {filteredPersons.map((person) => (
            <PersonRow key={person.id} person={person} lbl={lbl} />
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

  // Load data once
  useEffect(() => {
    fetch('/livnat-report.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ReportData>;
      })
      .then((d) => {
        setData(d);
        // Default: select first family
        if (d.families.length > 0) {
          setSelectedFamily(d.families[0].name);
        }
      })
      .catch(() => setLoadError(true));
  }, []);

  // When searching, find families that have matches
  const familiesWithMatches = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data.families;
    const q = searchQuery.toLowerCase();
    return data.families.filter((fam) =>
      fam.branches.some((branch) =>
        branch.persons.some((p) => p.name.toLowerCase().includes(q))
      )
    );
  }, [data, searchQuery]);

  // Auto-select first matching family on search change
  useEffect(() => {
    if (searchQuery && familiesWithMatches.length > 0) {
      const currentStillMatches = familiesWithMatches.some(
        (f) => f.name === selectedFamily
      );
      if (!currentStillMatches) {
        setSelectedFamily(familiesWithMatches[0].name);
      }
    }
  }, [searchQuery, familiesWithMatches, selectedFamily]);

  const currentFamily = useMemo(
    () => (data?.families ?? []).find((f) => f.name === selectedFamily) ?? null,
    [data, selectedFamily]
  );

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-40 text-red-600">
        {lbl.error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-500 animate-pulse">
        {lbl.loading}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex flex-col h-full min-h-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-stone-200 bg-amber-50">
        <div>
          <h2 className="text-lg font-bold text-amber-900">{lbl.title}</h2>
          <p className="text-xs text-stone-500">
            {lbl.totalPersons}: {data.meta.totalPersons.toLocaleString()} ·{' '}
            {data.meta.totalBranches} {lbl.branches}
          </p>
        </div>
        {/* Search */}
        <input
          type="search"
          placeholder={lbl.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar: family list */}
        <aside className="w-44 shrink-0 border-e border-stone-200 overflow-y-auto bg-white">
          <div className="px-2 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wide">
            {lbl.families}
          </div>
          <ul>
            {(searchQuery ? familiesWithMatches : data.families).map((fam) => {
              const isSelected = fam.name === selectedFamily;
              return (
                <li key={fam.name}>
                  <button
                    onClick={() => setSelectedFamily(fam.name)}
                    className={`w-full text-start px-3 py-2 text-sm flex items-center justify-between gap-1 transition-colors ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 font-semibold border-e-2 border-amber-600'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{fam.name}</span>
                    <span
                      className={`shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] font-bold px-1 ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {fam.branches.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {searchQuery && familiesWithMatches.length === 0 && (
            <p className="px-3 py-4 text-xs text-stone-400">{lbl.noResults}</p>
          )}
        </aside>

        {/* Main content: branches within selected family */}
        <main className="flex-1 overflow-y-auto px-4 py-3">
          {currentFamily ? (
            <>
              <h3 className="text-base font-bold text-stone-700 mb-3">
                {currentFamily.name}
                <span className="ml-2 text-sm font-normal text-stone-400">
                  {currentFamily.branches.length} {lbl.branches}
                </span>
              </h3>
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
            <p className="text-stone-400 text-sm">{lbl.noResults}</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default ReportBrowser;
