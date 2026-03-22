# AGENTS.md

## Cursor Cloud specific instructions

This is a **data-only repository** containing genealogy/family tree CSV files. There are no applications, services, build systems, package managers, test suites, or linting configurations.

### Repository contents

- `canonical_genealogy_master_patched_manual_surnames_equivalences_2026-03-14.csv` — master genealogy dataset (~4,145 records, 13 columns)
- `heritage_6_mar_26 - FamilyTree.csv` — MyHeritage export (~4,067 records, 43 columns)
- `Family_Tree_Yael_Livnat.csv` — Hebrew-language family tree (~352 records, semicolon-delimited)
- `Family_Tree_Yael_Livnat_IMPROVED.csv` — small stub/template (5 records)

### Development notes

- No dependencies to install; no build, lint, or test commands.
- CSV files can be validated with Python's built-in `csv` module (no external packages required).
- The `remove-old-app` branch on the remote contains a React/Vite web application for visualizing the tree data, but that code is not present on `main`.
