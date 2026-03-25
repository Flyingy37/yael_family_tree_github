# AGENTS.md

## Repository overview

This is a **React + Vite + TypeScript** web app for exploring a family tree. Person and family data are compiled from local CSVs into `public/family-graph.json` by `scripts/build-graph.ts` (run automatically before dev/build via `prebuild`).

### Data (not in public git)

- `data/canonical.csv` and `data/curated.csv` are **gitignored** (privacy: living people, minors, DNA in notes). See `data/data_dictionary.md`.
- Without those files, `npm run build` / `npm run dev` cannot produce a full graph; clones of the public repo need a **private copy** of the CSVs in `data/`.
- Tree size is **data-dependent** (often thousands of people locally); the UI shows counts from the loaded JSON.

### Tooling

- **Package manager:** npm (`package.json`, `package-lock.json`)
- **Dev:** `npm run dev` (runs graph build then Vite)
- **Build:** `npm run build`
- No automated test suite is configured in this repo.

### Legacy / other branches

- Remote branch `remove-old-app` may contain older app history; `main` carries the current app and scripts.
