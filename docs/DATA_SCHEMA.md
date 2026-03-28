# Data Schema — Yael Family Tree

This document describes the CSV input schemas consumed by `scripts/build-graph.ts` and the JSON output schema written to `public/family-graph.json`.

---

## Input: `data/canonical.csv` (RawCanonical)

Primary person records, one row per individual. Columns:

| Column | Type | Description |
|--------|------|-------------|
| `ged_id` | string | GEDCOM xref ID, e.g. `@I42@` |
| `full_name` | string | Full display name |
| `given_final` | string | Normalised given name |
| `surname` | string | Birth surname |
| `surname_final` | string | Final/married surname |
| `sex` | `M` / `F` / `U` | Sex code |
| `birth_date` | string | GEDCOM date string, e.g. `1 JAN 1920`, `ABT 1900` |
| `birth_place` | string | Comma-separated place hierarchy, e.g. `Vilna, Lithuania` |
| `fams` | string | Pipe-separated list of FAM xrefs where person is a spouse |
| `famc` | string | FAM xref where person is a child |
| `titl` | string | Title / honorific |
| `note` | string | Raw GEDCOM NOTE text |
| `note_plain` | string | Plain-text note (HTML stripped) |

### Sample

See `data/sample/canonical.sample.csv`.

---

## Input: `data/curated.csv` (RawCurated)

Curated subset with Hebrew metadata and relationship annotations. Columns:

| Column | Type | Description |
|--------|------|-------------|
| `Hops` | number string | Graph distance from root person |
| `Relationship to Yael` | string | Human-readable relationship label |
| `Full Name` | string | Display name (may differ from canonical) |
| `Birth Name` | string | Name at birth / maiden name |
| `Birth Year` | number string | 4-digit year |
| `Birth City` | string | City of birth |
| `Generation` | number string | Generational distance (negative = ancestor) |
| `Father Name` | string | Father's display name |
| `Mother Name` | string | Mother's display name |
| `Spouse Name` | string | Spouse's display name |
| `Children Names` | string | Comma-separated children's names |
| `ID` | string | GEDCOM xref ID matching `canonical.csv` `ged_id` |

### Sample

See `data/sample/curated.sample.csv`.

---

## Output: `public/family-graph.json` (FamilyGraph)

```json
{
  "rootPersonId": "@I1@",
  "persons": [ /* Person[] */ ],
  "families": [ /* Family[] */ ]
}
```

### Person object

```typescript
interface Person {
  id: string;               // GEDCOM xref, e.g. "@I42@"
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null; // GEDCOM date string
  deathDate: string | null;
  birthPlace: string | null;
  deathPlace: string | null;
  generation: number | null;
  relationToYael: string | null;
  hops: number | null;
  dnaInfo: string | null;
  /** GPS [lat, lng] derived from the normalised birthplace name via the built-in BIRTHPLACE_COORD_MAP. */
  birthplaceCoordinates: [number, number] | null;
  /** GPS [lat, lng] from an explicit Epithet field in GEDCOM notes (may differ from birthplaceCoordinates). */
  coordinates: [number, number] | null;
  familiesAsSpouse: string[];            // FAM xref IDs
  familyAsChild: string | null;          // FAM xref ID
  title: string | null;
  note: string | null;
  note_plain: string | null;
  photoUrl: string | null;
  hebrewName: string | null;
  birthName: string | null;
  fatherName: string | null;
  motherName: string | null;
  spouseName: string | null;
  childrenNames: string | null;
  surnameOrigin: string | null;
  jewishLineage: string | null;
  migrationInfo: string | null;
  holocaustVictim: boolean;
  warCasualty: boolean;
  connectionPathCount: number | null;
  doubleBloodTie: boolean;
  searchNormalized?: string;
  tags: string[];
}
```

### BirthplaceLocation object

Used by `useMap` and `MapView` to group people by their named birthplace.

```typescript
interface BirthplaceLocation {
  birthplace: string;                  // Canonical normalised birthplace name
  coordinates: [number, number] | null; // [lat, lng] for map rendering
  persons: Person[];                   // All persons born at this place
  personCount: number;
}
```

### Family object

```typescript
interface Family {
  id: string;         // FAM xref, e.g. "@F12@"
  spouses: string[];  // Person IDs
  children: string[]; // Person IDs
}
```

---

## Coordinates Resolution

`scripts/build-graph.ts` resolves birth places to GPS coordinates using two mechanisms:

1. **`birthplaceCoordinates`** — derived automatically from the normalised birthplace name via the built-in `BIRTHPLACE_COORD_MAP` table. This covers all entries in the `BIRTHPLACE_NORM` canonical place list. Persons with a recognised birthplace always receive a non-null `birthplaceCoordinates` value.
2. **`coordinates`** — extracted from an explicit `Epithet: [lat, lng]` field embedded in GEDCOM notes. This field is more precise but only populated when the source data includes the pattern.

The map view (`MapView.tsx`) uses `birthplaceCoordinates` first, then falls back to `coordinates`.  Entries without either field cannot be placed on the map.

---

## Tags

The `tags` array on each Person is populated by the build script based on flags:

| Tag | Condition |
|-----|-----------|
| `holocaust-victim` | `holocaustVictim === true` |
| `war-casualty` | `warCasualty === true` |
| `double-blood-tie` | `doubleBloodTie === true` |
| `has-photo` | `photoUrl !== null` |
| `has-hebrew-name` | `hebrewName !== null` |

---

## Supplemental Files (optional)

The build script optionally reads from `~/Downloads/`:
- RTF files containing Holocaust victim lists
- `surnames.csv` for surname-origin metadata

These files are not required; the script skips them gracefully when absent.
