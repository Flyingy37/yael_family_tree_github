# Family_Tree_Yael_Livnat Data Dictionary

Recommended GitHub structure after refresh:

- `Family_Tree_Yael_Livnat.csv` - Curated close-relatives export for easy browsing and manual review.
- `Family_Tree_Yael_Livnat_github.xlsx` - Excel version of the curated GitHub-friendly export.
- `genealogy_exports_cleaned_2026-03-13.xlsx` - Large cleaned master workbook for deeper research.
- `canonical_genealogy_master_patched_manual_surnames_equivalences_2026-03-14.csv` - Canonical flat table with standardized surnames.
- `heritage_6_mar_26_FamilyTree.csv` - Large family-tree export from heritage workflow.

## Curated CSV columns

- `קפיצות` - Number of generational jumps from Yael.
- `קשר ליעל` - Relationship to Yael.
- `שם מלא` - Full name.
- `שם לידה` - Birth name or maiden name.
- `שנת לידה` - Birth year.
- `עיר לידה` - Birth city.
- `דור` - Generation marker.
- `שם אב` - Father name.
- `שם אם` - Mother name.
- `שם בן/ת זוג` - Spouse name.
- `שם ילדים` - Children names.
- `ID` - Internal identifier.

## Recommendation

- Keep the curated CSV/XLSX for human-readable GitHub browsing.
- Keep one canonical master file for research and matching workflows.
- Keep the heritage export only if you still actively use that pipeline; otherwise it can stay outside the repo.
