import type { Person } from '../types';
import { coerceConnectionPathCount } from './coerceGraphPerson';

const HEBREW = /[\u0590-\u05FF]/;

/** GEDCOM-style pipe segments: show primary birth/death fragment only in summaries */
export function gedcomDatePrimary(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  return raw.split('|')[0]?.trim() || raw.trim();
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
