# Architecture Overview — Yael Family Tree

## Overview

This is a React + TypeScript single-page application that visualises genealogy data across four interactive views: tree, map, timeline, and statistics. The app is built with Vite, Tailwind CSS, ReactFlow, and Leaflet.

---

## Directory Structure

```
src/
├── app/                  # Route-level pages (lang-prefixed)
│   └── [lang]/
│       ├── layout.tsx    # Root layout with header/nav
│       ├── insights/     # Insights/statistics page
│       ├── person/[id]/  # Individual person detail page
│       └── tree/         # Tree exploration page
├── components/
│   ├── Common/           # Shared UI primitives
│   │   ├── ErrorBoundary.tsx
│   │   ├── Loading.tsx
│   │   └── SearchBar.tsx
│   ├── Layout/           # Structural shell components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── FilterPanel.tsx
│   ├── MapView.tsx
│   ├── PersonDetailPanel.tsx
│   ├── PersonNode.tsx
│   ├── SearchBar.tsx     # Canonical search implementation
│   ├── StatisticsView.tsx
│   ├── TimelineView.tsx
│   └── TreeView.tsx
├── hooks/
│   ├── useFamilyData.ts  # Core data-fetching hook
│   ├── useGraph.ts       # Graph-centric selectors
│   ├── useMap.ts         # Map-filtered person list
│   ├── useSearch.ts      # Fuse.js search wrapper
│   ├── useExpandCollapse.ts
│   └── useUiLanguage.ts
├── services/
│   ├── dataService.ts    # Low-level fetch + module cache
│   └── gedcomService.ts  # GEDCOM 5.5 line parser
├── types/
│   ├── index.ts          # Central re-export
│   ├── genealogy.ts      # Person, Family, FamilyGraph + extras
│   └── graph.ts          # ReactFlow node/edge data types
├── utils/
│   ├── csv-parser.ts     # Browser-side CSV parsing
│   ├── formatters.ts     # Date, name, place helpers
│   ├── layout.ts         # Dagre layout utilities
│   ├── subtree.ts        # Subtree extraction logic
│   ├── surname.ts        # Surname normalisation
│   └── treeHelpers.ts    # ReactFlow node/edge builders
├── pages/
│   ├── AboutPage.tsx
│   └── HomePage.tsx
├── performance/
│   └── webVitals.ts
├── App.tsx
├── FamilyExplorer.tsx
├── main.tsx
└── types.ts              # Canonical type definitions (source of truth)

scripts/
├── build-graph.ts        # CSV → public/family-graph.json pipeline
├── validate-data.ts      # Data integrity checks
└── generate-schema.ts    # JSON Schema generation

data/
└── sample/
    ├── canonical.sample.csv
    └── curated.sample.csv

public/
└── family-graph.json     # Generated at build time (gitignored if private)
```

---

## Data Flow

```
CSV files (data/)
      │
      ▼
scripts/build-graph.ts  ──►  public/family-graph.json
                                      │
                                      ▼
                              useFamilyData (hook)
                                      │
                          ┌───────────┼──────────────┐
                          ▼           ▼               ▼
                      useGraph     useMap         useSearch
                          │           │               │
                     TreeView     MapView        SearchBar
                     PersonNode   Leaflet        FilterPanel
```

### Key Data Types

- **`Person`** — one individual; ~35 fields including names, dates, places, relationship metadata, flags (holocaust victim, war casualty, double blood tie).
- **`Family`** — a GEDCOM FAM record linking spouses and children by ID.
- **`FamilyGraph`** — the root JSON structure: `{ persons[], families[], rootPersonId }`.

---

## State Management

The app uses **React hooks** for all state; there is no Redux or Zustand store.

| Hook | Responsibility |
|------|----------------|
| `useFamilyData` | Fetches `/family-graph.json`, builds `Map<id, Person>` and `Map<id, Family>`, constructs the Fuse.js search index. |
| `useGraph` | Wraps `useFamilyData`; adds `getPerson`, `getFamily`, `getChildren`, `getSpouses` selectors. |
| `useMap` | Filters persons to those with valid GPS coordinates. |
| `useSearch` | Manages query state and runs Fuse.js search. |
| `useExpandCollapse` | Manages node expansion state in the ReactFlow tree. |
| `useUiLanguage` | Manages Hebrew/English UI language toggle. |

---

## Routing

Routing is handled by **React Router v6** with a language prefix segment:

| Path | Component |
|------|-----------|
| `/` | `HomePage` |
| `/about` | `AboutPage` |
| `/explore/tree` | `TreeView` |
| `/explore/map` | `MapView` |
| `/explore/timeline` | `TimelineView` |
| `/explore/statistics` | `StatisticsView` |

---

## Build Pipeline

`npm run dev` runs two steps:

1. `tsx scripts/build-graph.ts` — reads CSV source files, resolves coordinates via place-name lookup, merges curated metadata, and writes `public/family-graph.json`.
2. `vite` — starts the dev server on `http://localhost:5173`.

`npm run build` produces a static bundle in `dist/`.

---

## Internationalisation

The UI supports **Hebrew (RTL) and English (LTR)** via the `useUiLanguage` hook. The language is stored in `localStorage` and applied as a `dir` attribute on the root element.

---

## Performance Notes

- The Fuse.js search index is built once in `useFamilyData` and memoised.
- ReactFlow nodes are generated lazily; subtree extraction (`utils/subtree.ts`) limits the rendered node count.
- Web Vitals are instrumented in `src/performance/webVitals.ts`.
