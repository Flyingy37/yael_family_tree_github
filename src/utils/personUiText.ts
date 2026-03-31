import type { Person } from '../types';
import { coerceConnectionPathCount } from './coerceGraphPerson';

const HEBREW = /[\u0590-\u05FF]/;

/** LRI + PDI: keep `1 Mar 1943` from reordering to `1943 Mar 1` in RTL (Hebrew) UI */
const LRI = '\u2066';
const PDI = '\u2069';

/** GEDCOM-style pipe segments: show primary birth/death fragment only in summaries */
export function gedcomDatePrimary(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  return raw.split('|')[0]?.trim() || raw.trim();
}

/**
 * Human-facing date: same as primary segment, but collapses placeholder day-month
 * (e.g. `01 JAN 1920`, `1 FEB 1850`) to year only, preserving ABT/BEF/AFT/CAL/EST.
 */
export function gedcomDateDisplay(raw: string | null | undefined): string | null {
  const primary = gedcomDatePrimary(raw);
  if (!primary) return null;
  const trimmed = primary.trim();
  const prefixMatch = trimmed.match(/^(ABT|BEF|AFT|CAL|EST)\s+/i);
  let prefix = '';
  let body = trimmed;
  if (prefixMatch) {
    prefix = `${prefixMatch[1].toUpperCase()} `;
    body = trimmed.slice(prefixMatch[0].length).trim();
  }
  const tok = body.split(/\s+/).filter(Boolean);
  if (tok.length === 3) {
    const day = parseInt(tok[0], 10);
    const year = tok[2];
    if (day === 1 && /^\d{4}$/.test(year)) {
      return wrapGedcomDateForBidi(prefix ? `${prefix.trimEnd()} ${year}` : year);
    }
  }
  if (tok.length === 1 && /^\d{4}$/.test(tok[0])) {
    return wrapGedcomDateForBidi(prefix ? `${prefix.trimEnd()} ${tok[0]}` : tok[0]);
  }
  return wrapGedcomDateForBidi(primary);
}

function wrapGedcomDateForBidi(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return `${LRI}${t}${PDI}`;
}

/** Semicolon / pipe compound surnames → readable separator */
export function formatCompoundFieldDisplay(
  value: string | null | undefined,
  lang: 'en' | 'he'
): string | null {
  if (!value?.trim()) return null;
  const sep = lang === 'he' ? ' · ' : ' / ';
  return value
    .split(/[|;]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .join(sep);
}

export function jewishLineageForUi(raw: string | null | undefined, lang: 'en' | 'he'): string | null {
  if (!raw?.trim()) return null;
  if (lang === 'he') return raw.trim();
  if (raw.trim() === 'כהן') return 'Kohen';
  return raw.trim();
}

export function relationTextForUi(person: Person, lang: 'en' | 'he'): string | null {
  const he = person.relationToYael?.trim() || null;
  const en = person.relationToYaelEn?.trim() || null;
  if (lang === 'he') return he || en || null;
  if (en) return en;
  if (he && !HEBREW.test(he)) return he;
  return null;
}

export function displayFullNameForUi(person: Person, lang: 'en' | 'he'): string {
  if (lang === 'he') return person.hebrewName?.trim() || person.fullName;
  return person.fullName;
}

export function formatPathCountDisplay(raw: unknown): string | null {
  const n = coerceConnectionPathCount(raw);
  return n == null ? null : String(n);
}

/**
 * Primary field is usually the main pipeline language (often Hebrew in curated);
 * `en` is optional English. English UI prefers `en`, then Latin-only primary.
 */
export function dualLangText(
  primary: string | null | undefined,
  en: string | null | undefined,
  lang: 'en' | 'he'
): string | null {
  const p = primary?.trim() || null;
  const e = en?.trim() || null;
  if (lang === 'he') return p || e || null;
  if (e) return e;
  if (p && !HEBREW.test(p)) return p;
  return null;
}
