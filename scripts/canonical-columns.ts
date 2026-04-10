/**
 * Canonical CSV column names expected by scripts/build-graph.ts (RawCanonical).
 * Keep in sync with the interface and sample data/sample/canonical.sample.csv.
 */
export const CANONICAL_CSV_COLUMNS = [
  'ged_id',
  'full_name',
  'given_final',
  'surname',
  'surname_final',
  'sex',
  'birth_date',
  'birth_place',
  'fams',
  'famc',
  'titl',
  'note',
  'note_plain',
] as const;

export type CanonicalColumn = (typeof CANONICAL_CSV_COLUMNS)[number];
