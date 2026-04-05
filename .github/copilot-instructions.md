# Copilot Agent Instructions — Family Tree Project

## Data Updates

### How to add or update family members

**DO NOT edit `public/family-graph.json` directly.** It is auto-generated and will be overwritten.

Edit `data/family-updates.json` instead. This file is committed to the repo and is automatically merged into `family-graph.json` at build time on every deployment (Vercel, GitHub Pages).

---

### Adding a new person

Add an entry to the `"persons"` array in `data/family-updates.json`:

```json
{
  "version": "1.0",
  "persons": [
    {
      "id": "@I9999@",
      "fullName": "שם מלא",
      "givenName": "שם פרטי",
      "surname": "שם משפחה",
      "sex": "M",
      "birthDate": "1 JAN 1950",
      "birthPlace": "Tel Aviv, Israel",
      "hebrewName": "שם בעברית",
      "relationToYael": "Uncle",
      "generation": 2,
      "familyAsChild": "@F5@",
      "familiesAsSpouse": [],
      "tags": [],
      "story": null
    }
  ],
  "overrides": {}
}
```

**ID format:** Use `@I<number>@` — pick a number not already in the graph.
**Date format:** `"D MMM YYYY"` e.g. `"13 FEB 1973"` (GEDCOM format).
**Sex:** `"M"` or `"F"`.
**All fields except `id` are optional** — use `null` for unknown values.

---

### Updating an existing person

Add an entry to the `"overrides"` object in `data/family-updates.json`:

```json
{
  "version": "1.0",
  "persons": [],
  "overrides": {
    "@I100@": {
      "story": "סיפור על האדם הזה בעברית...",
      "tags": ["DNA", "Holocaust"],
      "birthPlace": "Warsaw, Poland"
    }
  }
}
```

Available tag values: `"DNA"`, `"Holocaust"`, `"Partisan"`, `"Rabbi"`, `"Famous"`, `"Lineage"`, `"Heritage"`, `"Migration"`.

---

### Full person field reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | GEDCOM ID, e.g. `"@I9999@"` (required) |
| `fullName` | string | Full display name |
| `givenName` | string | First name |
| `surname` | string | Family name (birth) |
| `surnameFinal` | string | Family name (current/married) |
| `sex` | `"M"` or `"F"` | Gender |
| `birthDate` | string | GEDCOM date: `"D MMM YYYY"` |
| `deathDate` | string | GEDCOM date or null |
| `birthPlace` | string | City, Country |
| `hebrewName` | string | Name in Hebrew |
| `birthName` | string | Name at birth if different |
| `title` | string | e.g. `"Rabbi"`, `"Dr."` |
| `generation` | number | Generation from root (Yael = 0) |
| `relationToYael` | string | e.g. `"Grandmother"`, `"Cousin"` |
| `fatherName` | string | Father's full name |
| `motherName` | string | Mother's full name |
| `spouseName` | string | Spouse's full name |
| `familyAsChild` | string | Family ID where this person is a child, e.g. `"@F5@"` |
| `familiesAsSpouse` | string[] | Family IDs where this person is a spouse |
| `tags` | string[] | See tag values above |
| `story` | string | Narrative biography (Hebrew or English) |
| `holocaustVictim` | boolean | true/false |
| `warCasualty` | boolean | true/false |
| `migrationInfo` | string | Migration description |
| `jewishLineage` | string | Lineage notes |
| `note_plain` | string | Plain text notes |

---

## Code Changes

- UI components are in `src/components/`
- Page routes are in `src/app/[lang]/`
- Data loading hooks: `src/hooks/useFamilyData.ts`
- Run `npm run build` to verify changes before committing
- Run `npm test` to run unit tests

## Build Pipeline

```
data/family-updates.json  ← edit this for data changes
        ↓
scripts/apply-updates.ts  ← merges updates into graph
        ↓
public/family-graph.json  ← deployed to Vercel / GitHub Pages
        ↓
React app renders the tree
```
