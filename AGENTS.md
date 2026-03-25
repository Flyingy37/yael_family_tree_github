# AGENTS.md

## Cursor Cloud specific instructions

This is a **React + TypeScript family tree web application** built with Vite, Tailwind CSS, ReactFlow, and Leaflet. It visualizes genealogy data across tree, map, timeline, and statistics views.

### Data files (private — not in public repo)

<<<<<<< Current (Your changes)
- `canonical_genealogy_master_patched_manual_surnames_equivalences_2026-03-14.csv` - master genealogy dataset (~4,145 records, 13 columns)
- `heritage_6_mar_26 - FamilyTree.csv` - MyHeritage export (~4,067 records, 43 columns)
- `Family_Tree_Yael_Livnat.csv` - Hebrew-language family tree (~352 records, semicolon-delimited)
- `Family_Tree_Yael_Livnat_IMPROVED.csv` - small stub/template (5 records)
=======
The build script (`scripts/build-graph.ts`) reads two CSV files that are **gitignored** for privacy:
>>>>>>> Incoming (Background Agent changes)

- `data/canonical.csv` — master person records (GEDCOM-style columns: `ged_id`, `full_name`, `sex`, `birth_date`, `birth_place`, `fams`, `famc`, `note_plain`, etc.)
- `data/curated.csv` — curated subset with Hebrew columns and relationship metadata

If these files are missing, create minimal sample data matching the column schema in `scripts/build-graph.ts` (interfaces `RawCanonical` and `RawCurated`). The build script outputs `public/family-graph.json`.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (runs `build-graph.ts` then `vite`) |
| Type check | `npx tsc --noEmit` |
| Build | `npm run build` |

### Dev server notes

- `npm run dev` first executes `tsx scripts/build-graph.ts` to regenerate `public/family-graph.json`, then starts Vite on `http://localhost:5173`.
- The build-graph script also optionally reads supplemental RTF files from `~/Downloads/` and a `surnames.csv` — these are not required; the script gracefully skips them when absent.
- No linter is configured in `package.json`. Use `npx tsc --noEmit` for type checking.
- The app fetches `/family-graph.json` at runtime; if the file is missing or empty, the UI shows a loading error.

### Routes

- `/` — Landing/home page
- `/about` — About page
- `/explore/tree` — Interactive family tree (ReactFlow + Dagre layout)
- `/explore/map` — Leaflet map with person location markers
- `/explore/timeline` — Decade-based event timeline
- `/explore/statistics` — Statistics view
