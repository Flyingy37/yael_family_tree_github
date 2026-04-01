# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript family tree web application** built with Vite, Tailwind CSS, **@xyflow/react** (React Flow), and Leaflet. It visualizes genealogy data across tree, map, timeline, statistics, narrative archive, and person profile views.

### Data files (private — often gitignored)

**Paths used by `scripts/build-graph.ts`:**

- `data/canonical.csv` — master person records (GEDCOM-style columns: `ged_id`, `full_name`, `sex`, `birth_date`, `birth_place`, `fams`, `famc`, `note_plain`, etc.)
- `data/curated.csv` — optional curated subset with Hebrew columns and relationship metadata

Column details: `data/data_dictionary.md`.

You may keep other exports locally under different filenames (for example master genealogy CSV or MyHeritage dumps); copy or symlink into `data/canonical.csv` when building.

If `canonical.csv` is missing locally, `build-graph.ts` may fall back to `data/sample/canonical.sample.csv` (small stub) unless you rely on a pre-generated `public/family-graph.json`.

**Production / CI (e.g. Vercel):** `npm run build` runs `prebuild` (`scripts/prebuild-graph.ts`) then `vite build`. `prebuild-graph.ts` runs `build-graph.ts` only when `data/canonical.csv` exists, or when neither canonical nor `public/family-graph.json` exists (greenfield). When canonical is absent but `public/family-graph.json` is present, the committed JSON is kept so deploys ship a full graph without private CSV.

Output of a full graph build: `public/family-graph.json`.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` (runs `postinstall` for Playwright browser install) |
| Dev server | `npm run dev` (runs `build-graph.ts` then Vite) |
| Rebuild graph only | `npm run build-graph` |
| Type check | `npx tsc --noEmit` |
| Production build | `npm run build` |
| Unit tests | `npm run test:unit` (Vitest) |
| E2E tests | `npm run test:e2e` (Playwright) |
| All tests | `npm run test` |

Optional maintenance scripts: `report:unlinked`, `report:pdf-candidates`, `report:review-queue` (see `package.json`).

### Dev server notes

- `npm run dev` runs `tsx scripts/build-graph.ts` then Vite on `http://localhost:5173/`.
- `build-graph.ts` may read supplemental RTF files from `~/Downloads/` and `surnames.csv`; it skips them when absent.
- No ESLint is configured in `package.json`. Use `npx tsc --noEmit` for type checking.
- The app fetches `/family-graph.json` at runtime; if the file is missing or empty, the UI shows a loading error.

### Routes

- `/` — Landing / home
- `/about` — About page
- `/:lang` — Redirects to `/:lang/tree` (`he` | `en`)
- `/:lang/tree` — Family explorer (default view: tree). Query `?view=map`, `?view=timeline`, or `?view=stats` switches tabs inside the explorer.
- `/:lang/person/:id` — Person profile (graph id, e.g. `@I123@`)
- `/:lang/insights` — Statistics / analytics view
- `/:lang/archive` — Narrative family archive (searchable stories)

Legacy `/explore/*` paths redirect to `/he/tree` or `/he/insights` as appropriate. Unknown paths fall through to `/he/tree`.

### Human-facing docs

See `README.md` for Hebrew overview, privacy guidance for public repos, and project layout.
