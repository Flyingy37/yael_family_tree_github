/**
 * formatters — date, name, and place formatting helpers.
 */

/**
 * Extract a 4-digit year from a GEDCOM-style date string.
 * Handles formats like "1 JAN 1920", "ABT 1920", "BEF 1945", "1920".
 * Returns null if no year is found.
 */
export function extractYear(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const match = dateStr.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Format a GEDCOM date string for display.
 * Strips GEDCOM prefixes (ABT, BEF, AFT, CAL, EST) and returns a readable string.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr
    .replace(/^(ABT|BEF|AFT|CAL|EST)\s+/i, '')
    .trim();
}

const GEDCOM_MONTHS: Record<string, string> = {
  JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
};

/**
 * Format a GEDCOM-style date into a concise year-first display.
 * Examples:
 * - "18 APR 1926" -> "1926-04-18"
 * - "ABT 1950" -> "c. 1950"
 * - "AFT 1888" -> "> 1888"
 * - "1895" -> "1895"
 */
export function formatDateConcise(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === 'Y') return '';

  const qualifierMatch = trimmed.match(/^(ABT|BEF|AFT|CAL|EST)\s+(.+)$/i);
  const qualifier = qualifierMatch?.[1]?.toUpperCase() || null;
  const raw = qualifierMatch?.[2] || trimmed;

  const fullDate = raw.match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/i);
  const monthYear = raw.match(/^([A-Z]{3})\s+(\d{4})$/i);
  const yearOnly = raw.match(/^(\d{4})$/);

  let formatted = raw;

  if (fullDate) {
    const [, day, month, year] = fullDate;
    const monthNumber = GEDCOM_MONTHS[month.toUpperCase()];
    formatted = `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  } else if (monthYear) {
    const [, month, year] = monthYear;
    const monthNumber = GEDCOM_MONTHS[month.toUpperCase()];
    formatted = `${year}-${monthNumber}`;
  } else if (yearOnly) {
    formatted = yearOnly[1];
  }

  switch (qualifier) {
    case 'ABT':
      return `c. ${formatted}`;
    case 'BEF':
      return `< ${formatted}`;
    case 'AFT':
      return `> ${formatted}`;
    case 'CAL':
      return `cal. ${formatted}`;
    case 'EST':
      return `est. ${formatted}`;
    default:
      return formatted;
  }
}

/**
 * Build a short lifespan string, e.g. "1920–1985" or "b. 1920".
 */
export function formatLifespan(
  birthDate: string | null | undefined,
  deathDate: string | null | undefined
): string {
  const by = extractYear(birthDate);
  const dy = extractYear(deathDate);
  if (by && dy) return `${by}–${dy}`;
  if (by) return `b. ${by}`;
  if (dy) return `d. ${dy}`;
  return '';
}

/**
 * Capitalize the first letter of each word in a name.
 * Handles hyphenated names (Mary-Jane) and names with apostrophes (O'Brien).
 */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/(?:^|[\s\-'])(\w)/g, (_, c) => _.slice(0, -1) + c.toUpperCase());
}

/**
 * Normalize a string for accent-insensitive search
 * (removes diacritics, lowercases).
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Extract the country name from a birth-place string.
 * Returns the last comma-separated segment, trimmed.
 */
export function extractCountry(place: string | null | undefined): string | null {
  if (!place) return null;
  const parts = place.split(',');
  return parts[parts.length - 1].trim() || null;
}

const HISTORICAL_PLACE_REPLACEMENTS: Array<[RegExp, string]> = [
  [
    /\bPleshchenitsy\b(?:,\s*Borisov District,\s*Minsk Governorate,\s*Russian Empire)?/gi,
    'Pleshchenitsy, Borisov District, Minsk Governorate, Russian Empire',
  ],
  [
    /\bZembin\b(?:,\s*Borisov District,\s*Minsk Governorate,\s*Russian Empire)?/gi,
    'Zembin, Borisov District, Minsk Governorate, Russian Empire',
  ],
  [/\bBorisov district\b/gi, 'Borisov District'],
  [/\bMinsk province\b/gi, 'Minsk Governorate'],
  [/\bpostwar Belarus\b/gi, 'postwar Byelorussian SSR, Soviet Union'],
  [/\bBelarus\b/gi, 'Byelorussian SSR, Soviet Union'],
  [/\bHaifa\b(?!,\s*Mandatory Palestine)/gi, 'Haifa, Mandatory Palestine'],
  [/\bHolon\b(?!,\s*Israel)/gi, 'Holon, Israel'],
];

/**
 * Normalize a historical place name or place-bearing sentence to the branch's
 * archival display style.
 */
export function formatHistoricalPlace(text: string | null | undefined): string {
  if (!text) return '';
  let normalized = text.trim();
  if (!normalized) return '';
  for (const [pattern, replacement] of HISTORICAL_PLACE_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

/**
 * Backwards-compatible alias for historical-place formatting.
 */
export const formatHistoricalPlaceText = formatHistoricalPlace;
