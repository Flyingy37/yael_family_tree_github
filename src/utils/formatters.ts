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
 * Capitalise the first letter of each word in a name.
 * Handles hyphenated names (Mary-Jane) and names with apostrophes (O'Brien).
 */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/(?:^|[\s\-'])(\w)/g, (_, c) => _.slice(0, -1) + c.toUpperCase());
}

/**
 * Normalise a string for accent-insensitive search
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
