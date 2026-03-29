# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript family tree web application** built with Vite, Tailwind CSS, ReactFlow, and Leaflet. It visualizes genealogy data across tree, map, timeline, statistics, narrative archive, and person profile views.

### Data files (private — often gitignored)

**Paths used by `scripts/build-graph.ts`:**

- `data/canonical.csv` — master person records (GEDCOM-style columns: `ged_id`, `full_name`, `sex`, `birth_date`, `birth_place`, `fams`, `famc`, `note_plain`, etc.)
- `data/curated.csv` — optional curated subset with Hebrew columns and relationship metadata

You may keep other exports locally under different filenames (for example master genealogy CSV or MyHeritage dumps); copy or symlink into `data/canonical.csv` when building.

If `canonical.csv` is missing locally, `build-graph.ts` may fall back to `data/sample/canonical.sample.csv` (small stub) unless you rely on a pre-generated `public/family-graph.json`.

**Production / CI (e.g. Vercel):** `npm run build` runs `prebuild` → `scripts/prebuild-graph.ts`. When `data/canonical.csv` is absent, the committed `public/family-graph.json` is left in place so the full graph ships without private CSV.

Output of a full graph build: `public/family-graph.json`.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (runs `build-graph.ts` then `vite`) |
| Type check | `npx tsc --noEmit` |
| Build | `npm run build` |

### Dev server notes

- `npm run dev` runs `tsx scripts/build-graph.ts` then Vite on `http://localhost:5173/`.
- `build-graph.ts` may read supplemental RTF files from `~/Downloads/` and `surnames.csv`; it skips them when absent.
- No linter is configured in `package.json`. Use `npx tsc --noEmit` for type checking.
- The app fetches `/family-graph.json` at runtime; if the file is missing or empty, the UI shows a loading error.

### Routes

- `/` — Landing / home
- `/about` — About page
- `/:lang/tree` — Family explorer (default view: tree). Query `?view=map`, `?view=timeline`, or `?view=stats` switches tabs inside the explorer (`he` | `en`).
- `/:lang/person/:id` — Person profile
- `/:lang/insights` — Statistics / analytics view
- `/:lang/archive` — Narrative family archive (searchable stories)

Legacy `/explore/*` paths redirect to `/he/tree` or `/he/insights` as appropriate.
