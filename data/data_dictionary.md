# Family_Tree_Yael_Livnat Data Dictionary

## חשוב — פרטיות (עדכון)

קבצי **`canonical.csv`** ו־**`curated.csv`** אינם אמורים להיות בריפו **ציבורי** אם הם מכילים: מידע DNA, אנשים חיים, קטינים, או פרטים מזהים רבים. שמרי אותם **מקומית** או בריפו **פרטי** בלבד. לפרסום ציבורי יש לייצר **גרסה מסוננת** (בלי DNA, בלי קטינים, ולפי מדיניות משפחתית לאנשים חיים).

ייצואי עץ / מאסטרים גדולים (`Family_Tree_*.csv`, `heritage_*`, `canonical_genealogy_master*.csv`, וכו׳) — אותו עיקרון: לא ל־Git ציבורי.

---

מקורות עבודה (מחוץ לריפו ציבורי, לרוב):

- `Family_Tree_Yael_Livnat.csv` — ייצוא קרובים לבדיקה ידנית.
- `Family_Tree_Yael_Livnat_github.xlsx` — גרסת Excel.
- `genealogy_exports_cleaned_*.xlsx` — מאסטר ניקוי גדול.
- `canonical_genealogy_master_*.csv` — טבלה קנונית שטוחה.
- `heritage_*_FamilyTree.csv` — ייצוא מתהליך heritage.

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

- **ריפו ציבורי:** רק קוד + (אופציונלי) נתונים **מסוננים**; כל המאסטרים וה־DNA — ריפו פרטי או דיסק מקומי.
- **ריפו פרטי / מקומי:** שמירת מאסטר מלא, ייצואי MyHeritage/FTDNA, ודוחות פנימיים.
