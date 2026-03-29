"""
Enrich canonical_final_clean.csv with research notes and optional new stub rows.
Run from repository root:
  python3 tools/enrich_family_tree.py
"""
from __future__ import annotations

import os
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent


def append_note(df: pd.DataFrame, index: int, new_note: str) -> None:
    """Append a note without deleting existing text; skip if already present."""
    if "note" not in df.columns:
        df["note"] = ""
    existing = str(df.at[index, "note"]) if pd.notna(df.at[index, "note"]) else ""
    if new_note in existing:
        return
    if existing.strip():
        df.at[index, "note"] = f"{existing.strip()} | {new_note}"
    else:
        df.at[index, "note"] = new_note


def main() -> None:
    input_file = REPO_ROOT / "data" / "canonical_final_clean.csv"
    output_file = REPO_ROOT / "data" / "canonical_enriched.csv"

    if not input_file.is_file():
        print(f"Error: {input_file} not found.")
        return

    print("טוען את מסד הנתונים הקיים...")
    df = pd.read_csv(input_file, dtype=str)

    updates_count = 0
    for idx, row in df.iterrows():
        name = str(row["full_name"]).lower()
        bdate = str(row["birth_date"])

        if "joseph sosinski" in name and "1922" in bdate:
            append_note(
                df,
                idx,
                "ניצול שואה ופרטיזן. ברח מגטו דולגינוב, הצטרף לפרטיזנים ולאחר מכן לצבא האדום. עלה לישראל ב-1962.",
            )
            updates_count += 1

        if "kopel" in name and "alperovit" in name and "1907" in bdate:
            append_note(
                df,
                idx,
                "נספה בשואה. נרצח בגטו קראסנה יחד עם הוריו ואחיו.",
            )
            updates_count += 1

        if "rashka" in name and "alperowicz" in name:
            append_note(df, idx, "נספתה בשואה בגטו קראסנה.")
            updates_count += 1

    print(f"עודכנו הערות עבור {updates_count} אנשים קיימים.")

    new_people = [
        {
            "person_id": "@I_CASTRO_1@",
            "full_name": "Miguel Castro",
            "given_name": "Miguel",
            "surname": "Castro",
            "sex": "M",
            "note": (
                "אבי השושלת המשפחתית. אנוס שברח מספרד והתיישב בדרום צרפת. "
                "צאצאיו נדדו לאזור וילנה והשלטונות הרוסיים שינו את השם לקסטרל/קסטרול. "
                "מאוחר יותר, כדי להתחמק מ-12 שנות גיוס לצבא הצאר, פוצלו שמות המשפחה לאלפרוביץ' וגורביץ'."
            ),
        },
        {
            "person_id": "@I_ANDERS_1@",
            "full_name": "Edward Anders (Alperovitz)",
            "given_name": "Edward",
            "surname": "Anders",
            "sex": "M",
            "birth_date": "1926",
            "birth_place": "Liepaja",
            "note": (
                'ניצול שואה. שרד לאחר שאמו אריקה התחזתה לארית. היגר לארה"ב ב-1949 '
                "והפך לפרופסור בעל שם עולמי לכימיה באוניברסיטת שיקגו (חקר מטאוריטים עבור נאס\"א)."
            ),
        },
        {
            "person_id": "@I_PARTISAN_1@",
            "full_name": "Leizer Alperovitz",
            "given_name": "Leizer",
            "surname": "Alperovitz",
            "sex": "M",
            "birth_date": "1939",
            "note": (
                "ניצול שואה גיבור. בהיותו בן 4 חמק ליער נארוץ' כאשר הוריו נתפסו ונרצחו. "
                "חבר לפרטיזנים ושרד את המלחמה."
            ),
        },
        {
            "person_id": "@I_PARTISAN_2@",
            "full_name": "Eliyahu Alperovitz",
            "given_name": "Eliyahu",
            "surname": "Alperovitz",
            "sex": "M",
            "note": (
                "פרטיזן. ברח מקורניץ ליערות עם הוריו ראובן ומרקה. "
                "נפל בקרבות גבורה יחד עם אחיו הצעיר מרדכי (מוטיק) ב-1942/1943."
            ),
        },
    ]

    new_df = pd.DataFrame(new_people)
    final_df = pd.concat([df, new_df], ignore_index=True)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    final_df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(
        f'הקובץ המועשר נשמר בהצלחה: {output_file} (סה"כ רשומות: {len(final_df)})'
    )


if __name__ == "__main__":
    os.chdir(REPO_ROOT)
    main()
