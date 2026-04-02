import { useMemo, useCallback, useState } from 'react';
import type { Person } from '../types';

/* ── Generation palette (accent border colors) ───────────────────────── */

const GENERATION_ACCENT: Record<string, string> = {
  '3': '#2dd4bf',   // Teal-400
  '2': '#14b8a6',   // Teal-500
  '1': '#0d9488',   // Teal-600
  '0': '#d97706',   // Amber-600
  '-1': '#f59e0b',  // Amber-500
  '-2': '#fbbf24',  // Amber-400
  '-3': '#6366f1',  // Indigo-500
  '-4': '#818cf8',  // Indigo-400
  '-5': '#a5b4fc',  // Indigo-300
  '-6': '#4f46e5',  // Indigo-600
  '-7': '#4338ca',  // Indigo-700
  '-8': '#3730a3',  // Indigo-800
  '-9': '#312e81',  // Indigo-900
  '-10': '#1e1b4b', // Indigo-950
};

function getAccentColor(gen: number | null): string {
  if (gen === null) return '#94a3b8'; // Slate-400
  const key = String(Math.max(-10, Math.min(3, gen)));
  return GENERATION_ACCENT[key] ?? '#6366f1';
}

/* ── Extract 4-digit year ────────────────────────────────────────────── */

function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

/* ── Component ───────────────────────────────────────────────────────── */

interface GenerationsListViewProps {
  persons: Map<string, Person>;
  filteredIds: Set<string>;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

export function GenerationsListView({
  persons,
  filteredIds,
  onSelectPerson,
  language = 'en',
}: GenerationsListViewProps) {
  const isHe = language === 'he';
  const [expandedGens, setExpandedGens] = useState<Set<number>>(new Set());

  // Group people by generation
  const generationGroups = useMemo(() => {
    const groups = new Map<number, Person[]>();
    const unknownGen: Person[] = [];

    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person) continue;
      if (person.generation === null) {
        unknownGen.push(person);
      } else {
        const existing = groups.get(person.generation) ?? [];
        existing.push(person);
        groups.set(person.generation, existing);
      }
    }

    // Sort each group by name
    for (const [, group] of groups) {
      group.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    unknownGen.sort((a, b) => a.fullName.localeCompare(b.fullName));

    // Sort generations
    const sortedGens = Array.from(groups.keys()).sort((a, b) => a - b);

    return { sortedGens, groups, unknownGen };
  }, [filteredIds, persons]);

  const toggleGen = useCallback((gen: number) => {
    setExpandedGens(prev => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });
  }, []);

  const genLabel = useCallback((gen: number) => {
    if (isHe) {
      if (gen === 0) return 'דור השורש';
      if (gen > 0) return `דור +${gen} (צאצאים)`;
      return `דור ${gen} (אבות)`;
    }
    if (gen === 0) return 'Root Generation';
    if (gen > 0) return `Generation +${gen} (Descendants)`;
    return `Generation ${gen} (Ancestors)`;
  }, [isHe]);

  const { sortedGens, groups, unknownGen } = generationGroups;
  const allGens = unknownGen.length > 0
    ? [...sortedGens, null]
    : sortedGens;

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden"
      dir={isHe ? 'rtl' : 'ltr'}
      style={{ backgroundColor: '#F9F8F6' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-2">
        {/* Header */}
        <h2
          className="text-base font-bold text-stone-700 mb-3"
          style={{ fontFamily: "'Georgia', 'Noto Serif Hebrew', 'David Libre', serif" }}
        >
          {isHe ? 'תצוגת דורות' : 'Generations View'}
        </h2>

        {allGens.map(gen => {
          const genNum = gen as number | null;
          const people = genNum === null ? unknownGen : (groups.get(genNum) ?? []);
          const isExpanded = genNum === null
            ? expandedGens.has(999)
            : expandedGens.has(genNum);
          const accentColor = getAccentColor(genNum);
          const displayGen = genNum === null ? '?' : Math.abs(genNum);
          const displayPeople = isExpanded ? people : people.slice(0, 5);
          const hasMore = people.length > 5 && !isExpanded;

          return (
            <div
              key={genNum === null ? 'unknown' : genNum}
              className="rounded-lg border border-stone-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Generation header */}
              <button
                type="button"
                onClick={() => toggleGen(genNum ?? 999)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-start hover:bg-stone-50 transition-colors"
              >
                {/* Generation number marker — fixed width column */}
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-md font-bold text-white text-sm"
                  style={{
                    backgroundColor: accentColor,
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {displayGen}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold text-stone-700 truncate"
                    style={{ fontFamily: "'Georgia', 'Noto Serif Hebrew', 'David Libre', serif" }}
                  >
                    {genNum === null
                      ? (isHe ? 'דור לא ידוע' : 'Unknown Generation')
                      : genLabel(genNum)}
                  </div>
                  <div className="text-xs text-stone-400">
                    {people.length} {isHe ? 'אנשים' : 'people'}
                  </div>
                </div>

                <span className="flex-shrink-0 text-stone-400 text-xs">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Person items */}
              <div className="divide-y divide-stone-100">
                {displayPeople.map(person => (
                  <PersonListItem
                    key={person.id}
                    person={person}
                    accentColor={accentColor}
                    isHe={isHe}
                    isSelected={false}
                    onSelect={onSelectPerson}
                  />
                ))}
              </div>

              {/* Show more */}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => toggleGen(genNum ?? 999)}
                  className="w-full py-2 text-center text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors border-t border-stone-100"
                >
                  {isHe
                    ? `הצג את כל ${people.length} האנשים ▼`
                    : `Show all ${people.length} people ▼`}
                </button>
              )}
            </div>
          );
        })}

        {allGens.length === 0 && (
          <div className="text-center text-stone-500 py-8 text-sm">
            {isHe ? 'אין נתונים להצגה' : 'No data to display'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Person list item ────────────────────────────────────────────────── */

interface PersonListItemProps {
  person: Person;
  accentColor: string;
  isHe: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function PersonListItem({ person, accentColor, isHe, onSelect }: PersonListItemProps) {
  const birthY = extractYear(person.birthDate);
  const deathY = extractYear(person.deathDate);

  return (
    <button
      type="button"
      onClick={() => onSelect(person.id)}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-start hover:bg-stone-50 transition-colors group"
      style={{
        // RTL-aware indentation via padding-inline-start
        paddingInlineStart: '1rem',
      }}
    >
      {/* Accent border (vertical line on inline-start side) */}
      <span
        className="flex-shrink-0 self-stretch rounded-full"
        style={{
          width: 3,
          backgroundColor: accentColor,
          minHeight: 24,
        }}
        aria-hidden="true"
      />

      {/* Sex indicator */}
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{
          backgroundColor: person.sex === 'F' ? '#fce7f3' : person.sex === 'M' ? '#dbeafe' : '#f1f5f9',
          color: person.sex === 'F' ? '#9d174d' : person.sex === 'M' ? '#1e40af' : '#475569',
        }}
      >
        {person.sex === 'F' ? '♀' : person.sex === 'M' ? '♂' : '?'}
      </span>

      {/* Name and details */}
      <div className="min-w-0 flex-1">
        <div
          className="text-sm font-medium text-stone-700 truncate group-hover:text-stone-900"
          style={{ fontFamily: "'Georgia', 'Noto Serif Hebrew', 'David Libre', serif" }}
          title={person.fullName}
        >
          {person.fullName}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-400 min-w-0">
          {/* Dates */}
          {birthY != null && (
            <span className="flex-shrink-0 tabular-nums">
              {birthY}{deathY != null ? ` – ${deathY}` : ''}
            </span>
          )}

          {/* Location with overflow ellipsis */}
          {person.birthPlace && (
            <span
              className="truncate min-w-0 max-w-[180px]"
              title={person.birthPlace}
            >
              📍 {person.birthPlace}
            </span>
          )}
        </div>
      </div>

      {/* Tags badges */}
      {person.holocaustVictim && (
        <span
          className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800"
          title={isHe ? 'נספה בשואה' : 'Holocaust victim'}
        >
          ✡
        </span>
      )}
    </button>
  );
}
