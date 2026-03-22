import { useMemo } from 'react';
import type { Person } from '../types';

export interface Filters {
  generationMin: number;
  generationMax: number;
  sex: 'all' | 'M' | 'F';
  surname: string;
  hasDna: boolean;
  maxHops: number | null;
}

export const DEFAULT_FILTERS: Filters = {
  generationMin: -3,
  generationMax: 2,
  sex: 'all',
  surname: '',
  hasDna: false,
  maxHops: 5,
};

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  personList: Person[];
}

export function FilterPanel({ filters, onChange, personList }: Props) {
  const surnames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of personList) {
      const s = p.surnameFinal || p.surname;
      if (s) counts.set(s, (counts.get(s) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);
  }, [personList]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 text-sm" dir="rtl">
      <div className="font-bold text-gray-700">סינון</div>

      <div>
        <label className="text-xs text-gray-500">טווח דורות</label>
        <div className="flex gap-2 items-center mt-1">
          <input
            type="number"
            value={filters.generationMin}
            onChange={e => onChange({ ...filters, generationMin: parseInt(e.target.value) || -29 })}
            className="w-16 px-2 py-1 border rounded text-center text-xs"
            min={-29}
            max={2}
          />
          <span className="text-gray-400">עד</span>
          <input
            type="number"
            value={filters.generationMax}
            onChange={e => onChange({ ...filters, generationMax: parseInt(e.target.value) || 2 })}
            className="w-16 px-2 py-1 border rounded text-center text-xs"
            min={-29}
            max={2}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">קפיצות מיעל (מקסימום)</label>
        <div className="flex gap-2 items-center mt-1">
          <input
            type="number"
            value={filters.maxHops ?? ''}
            onChange={e => {
              const v = e.target.value;
              onChange({ ...filters, maxHops: v === '' ? null : parseInt(v) || 0 });
            }}
            className="w-16 px-2 py-1 border rounded text-center text-xs"
            min={0}
            max={30}
            placeholder="הכל"
          />
          <button
            className="text-xs text-blue-500 hover:text-blue-700"
            onClick={() => onChange({ ...filters, maxHops: null })}
          >
            הכל
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">מין</label>
        <div className="flex gap-2 mt-1">
          {(['all', 'M', 'F'] as const).map(s => (
            <button
              key={s}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                filters.sex === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onChange({ ...filters, sex: s })}
            >
              {s === 'all' ? 'הכל' : s === 'M' ? 'זכר' : 'נקבה'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">שם משפחה</label>
        <select
          value={filters.surname}
          onChange={e => onChange({ ...filters, surname: e.target.value })}
          className="w-full mt-1 px-2 py-1 border rounded text-xs"
        >
          <option value="">הכל</option>
          {surnames.map(([name, count]) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasDna}
            onChange={e => onChange({ ...filters, hasDna: e.target.checked })}
            className="rounded"
          />
          <span className="text-xs text-gray-600">רק עם מידע גנטי</span>
        </label>
      </div>

      <button
        className="w-full py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        onClick={() => onChange(DEFAULT_FILTERS)}
      >
        איפוס סינון
      </button>
    </div>
  );
}

export function applyFilters(personList: Person[], filters: Filters): Set<string> {
  const ids = new Set<string>();
  for (const p of personList) {
    if (p.generation !== null) {
      if (p.generation < filters.generationMin || p.generation > filters.generationMax) continue;
    }
    if (filters.sex !== 'all' && p.sex !== filters.sex) continue;
    if (filters.surname && (p.surnameFinal || p.surname) !== filters.surname) continue;
    if (filters.hasDna && !p.dnaInfo) continue;
    if (filters.maxHops !== null && p.hops !== null && p.hops > filters.maxHops) continue;
    ids.add(p.id);
  }
  return ids;
}
