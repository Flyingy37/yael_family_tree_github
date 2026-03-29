/**
 * formatters — date, name, and place formatting helpers.
 */

const GEDCOM_PLACEHOLDER_DAY = /^0?1\s+JAN\s+(\d{4})$/i;

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
 * Split a value that incorrectly contains both birth and death separated by "|"
 * (e.g. legacy graph rows before splitPipeField handled tight pipes).
 */
export function splitPipedDateValue(raw: string | null | undefined): {
  birth: string | null;
  death: string | null;
} {
  if (!raw?.trim()) return { birth: null, death: null };
  const t = raw.trim();
  if (t.includes(' | ')) {
    const [a, ...rest] = t.split(' | ');
    const b = rest.join(' | ').trim();
    return { birth: a.trim() || null, death: b || null };
  }
  if (t.includes('|')) {
    const parts = t.split('|').map(s => s.trim()).filter(Boolean);
    return {
      birth: parts[0] || null,
      death: parts[1] || null,
    };
  }
  return { birth: t, death: null };
}

/**
 * Resolve birth/death strings for display when death leaked into birthDate.
 */
export function resolvePersonDateFields(person: {
  birthDate: string | null;
  deathDate: string | null;
}): { birth: string | null; death: string | null } {
  let birth = person.birthDate?.trim() || null;
  let death = person.deathDate?.trim() || null;
  if (birth?.includes('|') && !death) {
    const s = splitPipedDateValue(birth);
    birth = s.birth;
    death = s.death;
  }
  return { birth, death };
}

/**
 * Format a GEDCOM date string for display: strip qualifiers, collapse 1 JAN YYYY to year,
 * title-case standard month abbreviations.
 */
export function formatGedcomDateForDisplay(dateStr: string | null | undefined): string {
  if (!dateStr?.trim()) return '';
  let v = dateStr.trim().replace(/^(ABT|BEF|AFT|CAL|EST)\s+/i, '').trim();
  const ph = v.match(GEDCOM_PLACEHOLDER_DAY);
  if (ph) return ph[1];
  v = v.replace(
    /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/gi,
    m => m.charAt(0) + m.slice(1).toLowerCase()
  );
  return v;
}

/**
 * Format a GEDCOM date string for display.
 * Strips GEDCOM prefixes (ABT, BEF, AFT, CAL, EST) and returns a readable string.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return formatGedcomDateForDisplay(dateStr);
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

/** Lifespan line for cards (uses en-dash, optional Hebrew could wrap at call site). */
export function formatPersonLifespanLine(person: {
  birthDate: string | null;
  deathDate: string | null;
}): string | null {
  const { birth, death } = resolvePersonDateFields(person);
  const by = extractYear(birth);
  const dy = extractYear(death);
  if (by != null && dy != null) return `${by} – ${dy}`;
  if (by != null) return `b. ${by}`;
  if (dy != null) return `d. ${dy}`;
  return null;
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
