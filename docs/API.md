# API Reference — Yael Family Tree

This document describes the hooks, services, and utility functions that form the internal API of the application.

---

## Hooks

### `useFamilyData()` → `FamilyData`

Core data hook. Fetches `/family-graph.json` and exposes the parsed graph.

```typescript
import { useFamilyData } from './hooks/useFamilyData';

const {
  persons,       // Map<string, Person>
  families,      // Map<string, Family>
  rootPersonId,  // string
  personList,    // Person[]
  searchIndex,   // Fuse<Person>
  loading,       // boolean
  error,         // string | null
  reload,        // () => void
} = useFamilyData();
```

---

### `useGraph()` → `GraphData`

Extends `useFamilyData` with graph-navigation helpers.

```typescript
import { useGraph } from './hooks/useGraph';

const {
  // ...all FamilyData fields
  allPersons,           // Person[]
  allFamilies,          // Family[]
  getPerson,            // (id: string) => Person | undefined
  getFamily,            // (id: string) => Family | undefined
  getChildren,          // (familyId: string) => Person[]
  getSpouses,           // (familyId: string) => Person[]
} = useGraph();
```

---

### `useMap()` → `MapData`

Returns only persons that have valid GPS coordinates.

```typescript
import { useMap } from './hooks/useMap';

const {
  mappablePersons,  // Person[] (coordinates guaranteed non-null)
  loading,          // boolean
  error,            // string | null
} = useMap();
```

---

### `useSearch(maxResults?)` → `SearchState`

Fuzzy search backed by Fuse.js.

```typescript
import { useSearch } from './hooks/useSearch';

const {
  query,      // string
  setQuery,   // (q: string) => void
  results,    // Person[]
  hasQuery,   // boolean
} = useSearch(50);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxResults` | `number` | `50` | Maximum results returned |

---

### `useExpandCollapse()`

Manages the expand/collapse state for ReactFlow tree nodes. See source for full interface.

---

### `useUiLanguage()` → `{ lang, setLang, isHebrew }`

Manages the Hebrew/English UI toggle, persisted to `localStorage`.

---

## Services

### `dataService`

Low-level fetch helper with module-level caching. Use in non-React contexts (scripts, tests).

```typescript
import { fetchFamilyGraph, invalidateCache } from './services/dataService';

// Fetch (cached after first call)
const graph = await fetchFamilyGraph();

// Pass an AbortSignal
const graph = await fetchFamilyGraph(controller.signal);

// Invalidate cache (e.g. in tests)
invalidateCache();
```

---

### `gedcomService`

Minimal GEDCOM 5.5 line-level parser.

```typescript
import { parseGedcomLines, extractIndiIds } from './services/gedcomService';

const lines = parseGedcomLines(rawGedcomText);
// lines: GedcomLine[] = [{ level, xref, tag, value }, ...]

const indiIds = extractIndiIds(lines);
// indiIds: string[] = ['@I1@', '@I2@', ...]
```

#### `GedcomLine`

```typescript
interface GedcomLine {
  level: number;
  xref: string | null;
  tag: string;
  value: string;
}
```

---

## Utilities

### `formatters`

```typescript
import {
  extractYear,
  formatDate,
  formatLifespan,
  titleCase,
  normalizeForSearch,
  extractCountry,
} from './utils/formatters';

extractYear('1 JAN 1920')        // → 1920
extractYear('ABT 1900')          // → 1900
formatDate('ABT 1920')           // → '1920'
formatLifespan('1920', '1985')   // → '1920–1985'
formatLifespan('1920', null)     // → 'b. 1920'
titleCase('ben gurion')          // → 'Ben Gurion'
normalizeForSearch('Müller')     // → 'muller'
extractCountry('Vilna, Lithuania') // → 'Lithuania'
```

---

### `csv-parser`

Browser-side CSV parsing (no Node.js dependencies).

```typescript
import { parseCsv } from './utils/csv-parser';

const rows = parseCsv(rawCsvString, {
  hasHeader: true,   // default
  delimiter: ',',    // default
  trim: true,        // default
});
// rows: Record<string, string>[]
```

---

### `layout` / `treeHelpers` / `subtree` / `surname`

Internal utilities used by `TreeView`. Refer to source files for documentation.

---

## Types

All public types are re-exported from `src/types/index.ts`:

```typescript
import type {
  // From genealogy.ts (re-exported from src/types.ts)
  Person,
  Family,
  FamilyGraph,
  RelationshipCategory,
  PersonSummary,
  // From graph.ts
  PersonNodeData,
  FamilyNodeData,
  NodeData,
  EdgeData,
  GraphMaps,
} from './types';
```

---

## Scripts

### `scripts/build-graph.ts`

Reads `data/canonical.csv` + `data/curated.csv`, resolves coordinates, merges metadata, and writes `public/family-graph.json`.

```bash
npx tsx scripts/build-graph.ts
```

### `scripts/validate-data.ts`

Validates CSV data against expected schemas and reports errors/warnings.

```bash
npx tsx scripts/validate-data.ts
```

### `scripts/generate-schema.ts`

Generates a JSON Schema file for `family-graph.json` based on the TypeScript interfaces.

```bash
npx tsx scripts/generate-schema.ts
```
