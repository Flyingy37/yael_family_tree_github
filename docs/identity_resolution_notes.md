# Identity Resolution Notes

Structured documentation for resolved and pending identity questions in the Yael Livnat (Zaidman) family tree.

---

## Template

Each identity resolution follows this structure:

| Field | Description |
|-------|-------------|
| **ID** | Short identifier (e.g. `IR-001`) |
| **Subject** | Person(s) whose identity is in question |
| **Claim** | The resolved or proposed identity statement |
| **Evidence** | Sources and data supporting the claim |
| **Confidence** | `High` / `Medium` / `Low` with brief justification |
| **Status** | `Resolved` / `Provisional` / `Open` |
| **Unresolved Items** | Remaining questions or follow-up needed |
| **Date** | Date of last update |

---

## IR-001: Frada Alperovich Identity Split (c.1833 vs c.1870)

| Field | Detail |
|-------|--------|
| **Subject** | Two individuals recorded as "Frada Alperovich" in the tree |
| **Status** | Resolved |
| **Date** | 2026-03-22 |

### Claim

Two distinct people named Frada Alperovich exist in the tree and must remain separate records:

1. **Older Frada (c.1833)** - Frada Kastrel, wife of Meir Alperovich (`@I198@`), daughter of Shmuel Kastrel + Pesia Alperovitch. Recorded as `@I199@` (fams=`@F35@`, famc=`@F69@`).
2. **Later Frada (c.1870)** - Frada (Freidel) Alperovich, spouse of Yehuda "Yudel" Alperovich (`@I80@`). Recorded as `@I120@` (fams=`@F84@`, famc=`@F16@`). Note: `@I81@` (fams=`@F16@`, no famc) may be a partial duplicate referencing the same person as Yehuda's wife.

### Evidence

| # | Evidence Item | Supports |
|---|---------------|----------|
| 1 | Birth dates ~37 years apart (c.1833 vs c.1870) | Separate individuals |
| 2 | `@I199@` is parent in family `@F35@` with Meir (`@I198@`, b.1819); `@I120@` is child of family `@F16@` (Yehuda + Frada/`@I81@`) | Different generational positions |
| 3 | `@I199@` famc=`@F69@` - children of `@F69@` carry Kastrel surname (Yehuda Leibe Kastroll, Moshe Simeon Kastrel, Yehoshua Kastrel, Aharon Kastrel, Miryam Kastroll, Noima Kastrel) | Older Frada's maiden name = Kastrel |
| 4 | Smart Match child-cluster evidence from MyHeritage | Constrained to later Frada (`@I120@`) only |
| 5 | `@I120@` death c.1939 in Mandatory Palestine; `@I199@` no death date recorded | Consistent with separate lifespans |

### Confidence

**High** - Generational gap, distinct spousal links, and independent family-of-origin data (`@F69@` vs `@F16@`) leave no plausible single-person interpretation.

### Unresolved Items

- [ ] `@I81@` (Frada Alperovich, b.1833, fams=`@F16@`, no famc) has the same birth year as `@I199@` but is linked to family `@F16@` (Yehuda's family) rather than `@F35@` (Meir's family). Determine whether `@I81@` is a data-entry duplicate of `@I199@` incorrectly assigned to `@F16@`, or represents a third Frada.
- [ ] No explicit "Shmuel Kastrel" record found as male parent in `@F69@`. The family currently lists two female parents: Sosha Esther Kastrel (`@I362@`) and Pesia Kastrol (`@I363@`). Verify whether Shmuel Kastrel should be added or whether the parent structure of `@F69@` needs correction.

---

## IR-002: Sosha Esther Kastrel - Non-canonical Status

| Field | Detail |
|-------|--------|
| **Subject** | `@I362@` Sosha Esther Kastrel (ABT 1810) |
| **Status** | Provisional |
| **Date** | 2026-03-22 |

### Claim

"Sosha Esther" remains **non-canonical** - treated as a probable UI/display artifact (e.g. MyHeritage Smart Match concatenation or import glitch) until stronger direct evidence (vital records, yizkor book entries, or DNA-corroborated descendant lines) appears.

### Evidence

| # | Evidence Item | Supports |
|---|---------------|----------|
| 1 | Name pattern "Sosha Esther" is unusual; may be two separate names concatenated by import | UI/display artifact hypothesis |
| 2 | `@I362@` is listed as parent in `@F69@` alongside `@I363@` Pesia Kastrol - two female parents in the same family is structurally unusual | Possible data issue |
| 3 | surname_final = "Alperovich" despite birth surname "Kastrel" - suggests married-name override | Potential import artifact |

### Confidence

**Low** - No independent primary-source corroboration found. Hypothesis rests on structural data anomalies.

### Unresolved Items

- [ ] Search Kurenets yizkor book and JRI-Poland records for "Sosha Esther Kastrel" or variants.
- [ ] Determine whether `@I362@` should be merged with another record, reclassified, or retained as a distinct ancestor pending further evidence.

---

## IR-003: Kurenets Place-Name Variants - Normalization

| Field | Detail |
|-------|--------|
| **Subject** | Multiple spelling variants of Kurenets across records |
| **Status** | Resolved |
| **Date** | 2026-03-22 |

### Claim

The following place-name variants all refer to the same location and should be treated as **label normalization**, not conflicting lineage evidence:

- Kurenets
- Kureniets
- Kurenets (Kureniets)
- Kurenets (Kureniets), Vileyka Uyezd, Vilna Governorate, Russian Empire
- Kurenets (Kureniets), Vileyka District, Wilno Voivodeship, Poland

### Evidence

| # | Evidence Item | Supports |
|---|---------------|----------|
| 1 | All variants map to the same geographic coordinates (~54.5167, 26.9167) as recorded in the epithet fields | Same physical location |
| 2 | Political boundary changes (Russian Empire → Poland → Soviet Union → Belarus) explain the administrative-unit differences | Historical context |

### Confidence

**High** - Geographic coordinates are identical; variants are transliteration and jurisdictional differences only.

### Unresolved Items

- [ ] Consider standardizing to a single canonical form (e.g. "Kurenets (Kureniets), Vileyka, Vilna Governorate") across all records for consistency.
