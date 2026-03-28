/**
 * gedcomService — minimal GEDCOM 5.5 utilities.
 *
 * The main data pipeline (scripts/build-graph.ts / scripts/parse-ged.ts)
 * produces family-graph.json from raw GEDCOM; this module provides helpers
 * for any runtime GEDCOM inspection needs.
 */

/** A single parsed GEDCOM line */
export interface GedcomLine {
  level: number;
  xref: string | null;
  tag: string;
  value: string;
}

/**
 * Parse a raw GEDCOM text string into an array of structured lines.
 * Does not build a full record tree — returns flat lines for lightweight use.
 */
export function parseGedcomLines(raw: string): GedcomLine[] {
  const results: GedcomLine[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(\d+)\s+(@[^@]+@)?\s*([A-Z_][A-Z0-9_]*)\s*(.*)?$/i);
    if (!match) continue;
    const [, level, xref, tag, value] = match;
    results.push({
      level: parseInt(level, 10),
      xref: xref ?? null,
      tag,
      value: (value ?? '').trim(),
    });
  }
  return results;
}

/** Extract all individual (INDI) xref IDs from parsed lines */
export function extractIndiIds(lines: GedcomLine[]): string[] {
  return lines
    .filter(l => l.level === 0 && l.xref && l.tag === 'INDI')
    .map(l => l.xref as string);
}
