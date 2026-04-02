import { useMemo } from 'react';
import type { Person } from '../types';
import { getCanonicalSurnameLabel } from '../utils/surname';
import { Dna, Landmark, Shield, Star, BookMarked, Scroll, Ship } from 'lucide-react';
import { HolocaustMemorialPatchIcon } from './HolocaustMemorialPatchIcon';

export interface Filters {
  generationMin: number;
  generationMax: number;
  sex: 'all' | 'M' | 'F';
  surname: string;
  connectedToYaelOnly: boolean;
  hasDna: boolean;
  holocaustVictimsOnly: boolean;
  hasHeritageTag: boolean;
  hasPartisanTag: boolean;
  hasFamousTag: boolean;
  hasRabbiTag: boolean;
  hasLineageTag: boolean;
  hasMigrationTag: boolean;
  hasDoubleBloodTieTag: boolean;
  doubleBloodTieMinPaths: number;
  maxHops: number | null;
  hideUnknownPlaceholders: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  generationMin: -29,
  generationMax: 2,
  sex: 'all',
  surname: '',
  connectedToYaelOnly: true,
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
};

const UNKNOWN_TOKEN_RE = /\b(?:unknown|fnu|lnu|n\/a|na)\b|לא ידוע/i;

function isUnknownPlaceholderText(value: string | null | undefined): boolean {
  const text = (value || '').trim();
  if (!text) return true;
  return UNKNOWN_TOKEN_RE.test(text);
}

export function isUnknownPlaceholderPerson(person: Person): boolean {
  return (
    isUnknownPlaceholderText(person.fullName) ||
    isUnknownPlaceholderText(person.givenName)
  );
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  personList: Person[];
  language?: 'en' | 'he';
}

export function FilterPanel({ filters, onChange, personList, language = 'en' }: Props) {
  const t = language === 'he';
  const surnames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of personList) {
      const source = p.surnameFinal || p.surname;
      const s = source ? getCanonicalSurnameLabel(source) : '';
      if (s) counts.set(s, (counts.get(s) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);
  }, [personList]);

  return (
    <div className="bg-white border border-stone-200 rounded p-3 space-y-3 text-sm" dir={t ? 'rtl' : 'ltr'}>
      <div className="font-medium text-stone-900">{t ? 'סינון' : 'Filters'}</div>

      <div className="space-y-3">
        <section className="border border-stone-100 rounded p-2 space-y-2">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
            {t ? 'זהות' : 'Identity'}
          </div>
          <div>
            <label className="text-xs text-gray-500">{t ? 'טווח דורות' : 'Generation range'}</label>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={filters.generationMin}
                onChange={e => {
                  const parsed = parseInt(e.target.value, 10);
                  onChange({ ...filters, generationMin: Number.isNaN(parsed) ? -29 : parsed });
                }}
                className="w-16 px-2 py-1 border rounded text-center text-xs"
                min={-29}
                max={2}
              />
              <span className="text-gray-400">{t ? 'עד' : 'to'}</span>
              <input
                type="number"
                value={filters.generationMax}
                onChange={e => {
                  const parsed = parseInt(e.target.value, 10);
                  onChange({ ...filters, generationMax: Number.isNaN(parsed) ? 2 : parsed });
                }}
                className="w-16 px-2 py-1 border rounded text-center text-xs"
                min={-29}
                max={2}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">{t ? 'מין' : 'Sex'}</label>
            <div className="flex gap-2 mt-1">
              {(['all', 'M', 'F'] as const).map(s => (
                <button
                  key={s}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filters.sex === s
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  onClick={() => onChange({ ...filters, sex: s })}
                >
                  {s === 'all' ? (t ? 'הכל' : 'All') : s === 'M' ? (t ? 'זכר' : 'Male') : (t ? 'נקבה' : 'Female')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">{t ? 'שם משפחה' : 'Surname'}</label>
            <select
              value={filters.surname}
              onChange={e => onChange({ ...filters, surname: e.target.value })}
              className="w-full mt-1 px-2 py-1 border rounded text-xs"
            >
              <option value="">{t ? 'הכל' : 'All'}</option>
              {surnames.map(([name, count]) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hideUnknownPlaceholders}
              onChange={e => onChange({ ...filters, hideUnknownPlaceholders: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600">
              {t ? '🙈 הסתר רשומות לא מזוהות (Unknown/FNU)' : '🙈 Hide unknown placeholders (Unknown/FNU)'}
            </span>
          </label>
        </section>

        <section className="border border-stone-100 rounded p-2 space-y-2">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
            {t ? 'קרבה' : 'Kinship'}
          </div>
          <div>
            <label className="text-xs text-gray-500">{t ? 'קפיצות מיעל (מקסימום)' : 'Hops from Yael (max)'}</label>
            <div className="flex gap-2 items-center mt-1">
              <input
                type="number"
                value={filters.maxHops ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  const parsed = parseInt(v, 10);
                  onChange({ ...filters, maxHops: v === '' || Number.isNaN(parsed) ? null : parsed });
                }}
                className="w-16 px-2 py-1 border rounded text-center text-xs"
                min={0}
                max={30}
                placeholder={t ? 'הכל' : 'all'}
              />
              <button
                className="text-xs text-stone-500 hover:text-stone-700"
                onClick={() => onChange({ ...filters, maxHops: null })}
              >
                {t ? 'הכל' : 'all'}
              </button>
            </div>
          </div>
          <div>
            <label
              className="flex items-center gap-2 cursor-pointer"
              title={t ? 'כמה מסלולי קרבה קצרים שונים ליעל קיימים לאותו אדם.' : 'How many distinct shortest kinship paths to Yael exist for a person.'}
            >
              <input
                type="checkbox"
                checked={filters.hasDoubleBloodTieTag}
                onChange={e => onChange({ ...filters, hasDoubleBloodTieTag: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-gray-600">{t ? '🧩 קשרי דם כפולים' : '🧩 Double blood ties'}</span>
            </label>
            {filters.hasDoubleBloodTieTag && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>{t ? 'מינימום מסלולים:' : 'Min paths:'}</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={filters.doubleBloodTieMinPaths}
                  onChange={e => {
                    const parsed = parseInt(e.target.value, 10);
                    onChange({
                      ...filters,
                      doubleBloodTieMinPaths: Number.isNaN(parsed) ? 3 : Math.max(2, parsed),
                    });
                  }}
                  className="w-14 px-1.5 py-0.5 border rounded text-xs"
                />
              </div>
            )}
          </div>
        </section>

        <section className="border border-stone-100 rounded p-2 space-y-2">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">DNA</div>
          <label
            className="flex items-center gap-2 cursor-pointer"
            title={t ? 'קשרים מבוססי התאמות DNA מאומתות בלבד.' : 'Links based on verified DNA match evidence only.'}
          >
            <input
              type="checkbox"
              checked={filters.hasDna}
              onChange={e => onChange({ ...filters, hasDna: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Dna size={11} className="text-stone-500" />{t ? 'קשרי DNA מאומתים' : 'Verified DNA links'}</span>
          </label>
        </section>

        <section className="border border-stone-100 rounded p-2 space-y-2">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
            {t ? 'היסטורי' : 'Historical'}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.holocaustVictimsOnly}
              onChange={e => onChange({ ...filters, holocaustVictimsOnly: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><HolocaustMemorialPatchIcon size={14} />{t ? 'קורבנות שואה' : 'Holocaust victims'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasHeritageTag}
              onChange={e => onChange({ ...filters, hasHeritageTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Landmark size={11} className="text-stone-500" />{t ? 'מורשת' : 'Heritage'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasPartisanTag}
              onChange={e => onChange({ ...filters, hasPartisanTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Shield size={11} className="text-gray-600" />{t ? 'פרטיזנים / מחתרת' : 'Partisans / Resistance'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasFamousTag}
              onChange={e => onChange({ ...filters, hasFamousTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Star size={11} className="text-stone-500" />{t ? 'אנשים מפורסמים' : 'Famous people'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasRabbiTag}
              onChange={e => onChange({ ...filters, hasRabbiTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><BookMarked size={11} className="text-stone-500" />{t ? 'רבנים ידועים' : 'Notable rabbis'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasLineageTag}
              onChange={e => onChange({ ...filters, hasLineageTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Scroll size={11} className="text-stone-500" />{t ? 'ייחוס (שושלת)' : 'Lineage'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasMigrationTag}
              onChange={e => onChange({ ...filters, hasMigrationTag: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-600 flex items-center gap-1"><Ship size={11} className="text-stone-500" />{t ? 'הגירה' : 'Migration'}</span>
          </label>
        </section>
      </div>

      <button
        className="w-full py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded transition-colors"
        onClick={() => onChange(DEFAULT_FILTERS)}
      >
        {t ? 'איפוס סינון' : 'Reset filters'}
      </button>
    </div>
  );
}

export function applyFilters(
  personList: Person[],
  filters: Filters,
  connectedIds?: Set<string>
): Set<string> {
  const ids = new Set<string>();
  for (const p of personList) {
    if (p.generation !== null) {
      if (p.generation < filters.generationMin || p.generation > filters.generationMax) continue;
    }
    if (filters.sex !== 'all' && p.sex !== filters.sex) continue;
    if (
      filters.surname &&
      getCanonicalSurnameLabel(p.surnameFinal || p.surname || '') !== filters.surname
    ) {
      continue;
    }
    if (filters.connectedToYaelOnly && connectedIds && !connectedIds.has(p.id)) continue;
    if (filters.hasDna && !p.tags.includes('DNA')) continue;
    if (filters.holocaustVictimsOnly && !p.holocaustVictim) continue;
    if (filters.hasHeritageTag && !p.tags.includes('Heritage')) continue;
    if (filters.hasPartisanTag && !p.tags.includes('Partisan')) continue;
    if (filters.hasFamousTag && !p.tags.includes('Famous')) continue;
    if (filters.hasRabbiTag && !p.tags.includes('Rabbi')) continue;
    if (filters.hasLineageTag && !p.tags.includes('Lineage')) continue;
    if (filters.hasMigrationTag && !p.tags.includes('Migration')) continue;
    if (filters.hasDoubleBloodTieTag) {
      const pathCount = p.connectionPathCount || 0;
      if (!p.tags.includes('DoubleBloodTie')) continue;
      if (pathCount < filters.doubleBloodTieMinPaths) continue;
    }
    if (filters.maxHops !== null && p.hops !== null && p.hops > filters.maxHops) continue;
    if (filters.hideUnknownPlaceholders && isUnknownPlaceholderPerson(p)) continue;
    ids.add(p.id);
  }
  return ids;
}
