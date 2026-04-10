# Family_Tree_Yael_Livnat Data Dictionary

## חשוב - פרטיות (עדכון)

קבצי **`canonical.csv`** ו־**`curated.csv`** אינם אמורים להיות בריפו **ציבורי** אם הם מכילים: מידע DNA, אנשים חיים, קטינים, או פרטים מזהים רבים. שמרי אותם **מקומית** או בריפו **פרטי** בלבד. לפרסום ציבורי יש לייצר **גרסה מסוננת** (בלי DNA, בלי קטינים, ולפי מדיניות משפחתית לאנשים חיים).

ייצואי עץ / מאסטרים גדולים (`Family_Tree_*.csv`, `heritage_*`, `canonical_genealogy_master*.csv`, וכו׳) - אותו עיקרון: לא ל־Git ציבורי.

---

## Canonical CSV — מה `build-graph.ts` מצפה לו

הקובץ **`data/canonical.csv`** הוא קלט חובה לבנייה מקומית. שורה ראשונה: **כותרות עמודות** (שורת CSV אחת). שמות העמודות חייבים להתאים בדיוק (רגיש לרישיות) לרשימה שלהלן — ראו גם `data/sample/canonical.sample.csv`.

| עמודה | הערות קצרות |
|--------|----------------|
| `ged_id` | מזהה GEDCOM, למשל `@I1@` |
| `full_name` | שם מלא (גם למיזוג עם curated לפי שם) |
| `given_final` | שם פרטי |
| `surname` | שם משפחה |
| `surname_final` | שם משפחה נוכחי / אחרון |
| `sex` | `M` / `F` / אחר → לא ידוע |
| `birth_date` | פורמט GEDCOM; אפשר `\|` להפרדת לידה/פטירה בתוך אותו שדה לפי לוגיקת `splitPipeField` בסקריפט |
| `birth_place` | מקום/ים; אפשר `\|` כמו ב־birth_date |
| `fams` | משפחות כבן/בת זוג, מופרדות ב־`\|` |
| `famc` | משפחה כילד |
| `titl` | תואר |
| `note` | הערה (יכול HTML) |
| `note_plain` | הערה טקסטואלית — משמש חילוץ שדות מובנים |

**בדיקה מהירה:** `npm run validate:canonical` — בודק שכל העמודות קיימות. אפשר נתיב מותאם: `npx tsx scripts/validate-canonical-csv.ts path/to/file.csv`

**מקור חיצוני** (למשל `canonical_final_clean.csv`): האתר לא קורא את השם הזה. מעתיקים/מייצאים ל־`data/canonical.csv` בפורמט לעיל, מריצים `npm run build-graph` (או `npm run dev`), ואז מתקבל `public/family-graph.json`.

## Curated CSV — פורמט מול `build-graph.ts`

`data/curated.csv` **אופציונלי**. הסקריפט קורא את הקובץ בלי `columns: true`: **שורה 0** נחשבת לכותרת/כותרת מסמך (לא משמשת כעמודות), **שורה 1** היא שורת הכותרות האמיתית, **משורה 2** הנתונים. כותרות בשורה 1 חייבות להיות באנגלית כפי שמופיע ב־`RawCurated` ב־`build-graph.ts` (למשל `Full Name`, `Hops`, `Relationship to Yael`, ...). רשימת העמודות בתיעוד למטה (`## Curated CSV columns`) מתארת משמעות — אם הייצוא שלך בעברית בלבד, ייתכן שתצטרכי מיפוי לכותרות האנגליות לפני הבנייה.

---

מקורות עבודה (מחוץ לריפו ציבורי, לרוב):

- `Family_Tree_Yael_Livnat.csv` - ייצוא קרובים לבדיקה ידנית.
- `Family_Tree_Yael_Livnat_github.xlsx` - גרסת Excel.
- `genealogy_exports_cleaned_*.xlsx` - מאסטר ניקוי גדול.
- `canonical_genealogy_master_*.csv` - טבלה קנונית שטוחה.
- `heritage_*_FamilyTree.csv` - ייצוא מתהליך heritage.

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

- **ריפו ציבורי:** רק קוד + (אופציונלי) נתונים **מסוננים**; כל המאסטרים וה־DNA - ריפו פרטי או דיסק מקומי.
- **ריפו פרטי / מקומי:** שמירת מאסטר מלא, ייצואי MyHeritage/FTDNA, ודוחות פנימיים.
