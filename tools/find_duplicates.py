#!/usr/bin/env python3
"""
find_duplicates.py — מציאת כפילויות באילן היוחסין
Genealogy Duplicate Finder using pandas + RapidFuzz.

Detects potential duplicate individuals by combining fuzzy name matching
with birth/death year comparison and parent overlap checks.

Usage:
    python3 find_duplicates.py canonical.csv [OPTIONS]
    python3 find_duplicates.py canonical.csv unconnected_people.csv   # cross-file mode

Options:
    --output FILE         Output CSV path (default: duplicates_YYYYMMDD.csv)
    --name-threshold N    Min Jaro-Winkler score 0-100 to consider (default: 82)
    --year-tolerance N    Max year difference still counted as match (default: 3)
    --same-sex-only       Skip pairs with conflicting sex values
    --limit N             Max candidate pairs to evaluate (default: 50000)

Requirements:
    pip install pandas rapidfuzz
"""

import re
import sys
import argparse
import warnings
from datetime import date
from itertools import combinations
from pathlib import Path

import pandas as pd
from rapidfuzz import fuzz, process
from rapidfuzz.distance import JaroWinkler

warnings.filterwarnings("ignore", category=FutureWarning)


# ── Constants ─────────────────────────────────────────────────────────────────

# Names that mean "unknown" and should be treated as null
NULL_NAME_TOKENS = {
    "fnu", "lnu", "unknown", "unk", "unnamed", "unlisted",
    "not known", "not listed", "no name", "נ/א", "לא ידוע", "?", "-",
    "d1", "d2", "d3", "s1", "s2", "s3",        # placeholder children
    "nn", "n n", "n.n.", "xxx",
}

PUNCTUATION_RE = re.compile(r"[^\w\s]", re.UNICODE)
MULTI_SPACE_RE = re.compile(r"\s+")
YEAR_RE        = re.compile(r"\b(1[0-9]{3}|20[0-2][0-9])\b")   # 1000-2029

# ── Date helpers ──────────────────────────────────────────────────────────────

def extract_year(raw) -> int | None:
    """Pull the first 4-digit year out of any date string (e.g. '1 JAN 1765', 'ABT 1800')."""
    if pd.isna(raw):
        return None
    m = YEAR_RE.search(str(raw))
    return int(m.group(0)) if m else None


def years_match(y1, y2, tolerance: int) -> bool | None:
    """
    True  — both years present and within tolerance
    False — both present and differ more than tolerance
    None  — at least one year is missing (cannot compare)
    """
    if y1 is None or y2 is None:
        return None
    return abs(y1 - y2) <= tolerance


# ── Name helpers ──────────────────────────────────────────────────────────────

def normalize_name(raw) -> str | None:
    """
    Lowercase, strip punctuation, collapse whitespace.
    Returns None if the result is a known null token or empty.
    """
    if pd.isna(raw):
        return None
    s = str(raw).strip()
    s = PUNCTUATION_RE.sub(" ", s)
    s = MULTI_SPACE_RE.sub(" ", s).strip().lower()
    if not s or s in NULL_NAME_TOKENS:
        return None
    # Also reject if *every* token is a null token
    tokens = set(s.split())
    if tokens.issubset(NULL_NAME_TOKENS):
        return None
    return s


def name_key(given: str | None, surname: str | None) -> str | None:
    """Combine given + surname into a single matchable string."""
    parts = [p for p in (given, surname) if p]
    return " ".join(parts) if parts else None


# ── CSV loader ────────────────────────────────────────────────────────────────

# Map of known column-name aliases → canonical internal names
COLUMN_ALIASES: dict[str, str] = {
    # id
    "ged_id": "person_id", "id": "person_id", "indid": "person_id",
    # given name
    "given_name": "given_name", "given_final": "given_name", "givenname": "given_name",
    "firstname": "given_name", "first_name": "given_name",
    # surname
    "surname": "surname", "surname_final": "surname", "lastname": "surname",
    "last_name": "surname", "family_name": "surname",
    # full name
    "full_name": "full_name", "fullname": "full_name",
    # sex
    "sex": "sex", "gender": "sex",
    # birth / death
    "birth_date": "birth_date", "birthdate": "birth_date", "birth_year": "birth_year",
    "death_date": "death_date", "deathdate": "death_date", "death_year": "death_year",
    # parents
    "famc": "famc", "parents": "famc",
    "fams": "fams",
}


def load_csv(path: Path, source_label: str = "") -> pd.DataFrame:
    """Load a genealogy CSV and normalise columns to a standard schema."""
    df = pd.read_csv(path, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]

    # Rename known aliases — build a safe mapping that avoids creating duplicate columns.
    # Priority: if a canonical name already exists as a raw column, skip aliasing onto it.
    rename_map: dict[str, str] = {}
    canonical_targets_already_present = {
        COLUMN_ALIASES[c] for c in df.columns if c in COLUMN_ALIASES and c == COLUMN_ALIASES[c]
    }
    for col in df.columns:
        if col in COLUMN_ALIASES:
            target = COLUMN_ALIASES[col]
            # Only rename if this column isn't already named correctly AND we haven't
            # already mapped another column to this target in this pass.
            if col != target and target not in rename_map.values():
                # Skip if the *exact* target column already exists (prefer the real one)
                if target not in df.columns:
                    rename_map[col] = target
    df = df.rename(columns=rename_map)

    # Drop any remaining duplicate columns (keep first occurrence)
    df = df.loc[:, ~df.columns.duplicated(keep="first")]

    # Synthesise person_id if missing
    if "person_id" not in df.columns:
        df["person_id"] = [f"R{i}" for i in range(len(df))]

    # Synthesise given_name / surname from full_name if needed
    if "given_name" not in df.columns and "full_name" in df.columns:
        parts = df["full_name"].str.split(n=1, expand=True)
        df["given_name"] = parts[0]
        df["surname"]    = parts[1] if 1 in parts.columns else None
    if "surname" not in df.columns:
        df["surname"] = None

    # Extract year columns from date strings
    for col, year_col in [("birth_date", "birth_year"), ("death_date", "death_year")]:
        if col in df.columns and year_col not in df.columns:
            df[year_col] = df[col].apply(extract_year)
        elif year_col not in df.columns:
            df[year_col] = None
        else:
            df[year_col] = pd.to_numeric(df[year_col], errors="coerce")

    # Normalise names
    df["_given_norm"]   = df["given_name"].apply(normalize_name) if "given_name" in df.columns else None
    df["_surname_norm"] = df["surname"].apply(normalize_name)   if "surname"     in df.columns else None
    df["_name_key"]     = df.apply(lambda r: name_key(r["_given_norm"], r["_surname_norm"]), axis=1)

    # Source label (for cross-file mode)
    df["_source"] = source_label or path.stem

    return df


# ── Candidate generation ──────────────────────────────────────────────────────

def same_sex(row_a, row_b) -> bool:
    """Return False only if both rows have a sex value AND they differ."""
    sa = str(row_a.get("sex", "")).strip().upper()[:1]
    sb = str(row_b.get("sex", "")).strip().upper()[:1]
    if sa in ("M", "F") and sb in ("M", "F"):
        return sa == sb
    return True   # unknown = compatible


def parent_overlap(famc_a, famc_b) -> bool:
    """True if the two people share at least one family-as-child entry."""
    if pd.isna(famc_a) or pd.isna(famc_b):
        return False
    a_set = set(str(famc_a).split("|"))
    b_set = set(str(famc_b).split("|"))
    return bool(a_set & b_set)


# ── Confidence scoring ────────────────────────────────────────────────────────

def confidence_and_action(
    name_score: float,
    birth_match,
    death_match,
    same_surname: bool,
    parents_overlap: bool,
    same_sex_flag: bool,
) -> tuple[str, str]:
    """
    Returns (confidence_level, recommended_action).

    confidence_level: 'HIGH' | 'MEDIUM' | 'LOW'
    recommended_action: 'MERGE' | 'HOLD' | 'REJECT'
    """
    if not same_sex_flag:
        return "LOW", "REJECT"

    # Points system: accumulate evidence
    score = 0.0

    # Name similarity (0-100 → 0-50 points)
    score += (name_score / 100) * 50

    # Birth year match
    if birth_match is True:
        score += 20
    elif birth_match is False:
        score -= 25   # strong contra-indicator

    # Death year match
    if death_match is True:
        score += 15
    elif death_match is False:
        score -= 15

    # Same surname (extra reward when only given name is fuzzy)
    if same_surname:
        score += 10

    # Shared parent family (very strong evidence)
    if parents_overlap:
        score += 20

    # Decision thresholds
    if score >= 70:
        confidence, action = "HIGH", "MERGE"
    elif score >= 45:
        confidence, action = "MEDIUM", "HOLD"
    else:
        confidence, action = "LOW", "REJECT"

    return confidence, action


# ── Main deduplication engine ─────────────────────────────────────────────────

def find_duplicates(
    df_a: pd.DataFrame,
    df_b: pd.DataFrame | None,
    name_threshold: float,
    year_tolerance: int,
    same_sex_only: bool,
    pair_limit: int,
) -> pd.DataFrame:
    """
    Compare df_a against df_b (or itself if df_b is None).
    Returns a triage DataFrame.
    """
    cross_file = df_b is not None
    df_b = df_b if cross_file else df_a

    # Drop rows with no matchable name
    pool_a = df_a[df_a["_name_key"].notna()].copy()
    pool_b = df_b[df_b["_name_key"].notna()].copy()

    if pool_a.empty or pool_b.empty:
        print("⚠️  No matchable names found — check your CSV columns.", file=sys.stderr)
        return pd.DataFrame()

    print(f"  Pool A: {len(pool_a)} people with names")
    print(f"  Pool B: {len(pool_b)} people with names")

    # Build lookup: name_key → row index for pool_b
    b_names  = pool_b["_name_key"].tolist()
    b_ids    = pool_b["person_id"].tolist()

    rows: list[dict] = []
    pairs_seen: set[frozenset] = set()
    evaluated = 0

    for _, row_a in pool_a.iterrows():
        if evaluated >= pair_limit:
            print(f"  ⚠️  Reached pair limit ({pair_limit}). Use --limit to increase.")
            break

        key_a = row_a["_name_key"]
        id_a  = row_a["person_id"]

        # RapidFuzz process.extract: fast top-N fuzzy matches from pool_b
        matches = process.extract(
            key_a,
            b_names,
            scorer=fuzz.WRatio,       # weighted ratio, robust for short names
            score_cutoff=name_threshold,
            limit=20,
        )

        for matched_name, raw_score, b_idx in matches:
            id_b = b_ids[b_idx]
            row_b = pool_b.iloc[b_idx]

            # Skip self-comparison in within-file mode
            if not cross_file and id_a == id_b:
                continue

            # Deduplicate pairs (A,B) == (B,A) within-file
            pair_key = frozenset({id_a, id_b})
            if pair_key in pairs_seen:
                continue
            pairs_seen.add(pair_key)
            evaluated += 1

            # Sex filter
            sx_ok = same_sex(row_a, row_b)
            if same_sex_only and not sx_ok:
                continue

            # Jaro-Winkler (0-100) as the primary reported score
            jw_score = JaroWinkler.normalized_similarity(key_a, matched_name) * 100

            # Year comparisons
            b_yr = extract_year(row_b.get("birth_year") or row_b.get("birth_date"))
            d_yr = extract_year(row_b.get("death_year") or row_b.get("death_date"))
            a_byr = extract_year(row_a.get("birth_year") or row_a.get("birth_date"))
            a_dyr = extract_year(row_a.get("death_year") or row_a.get("death_date"))

            bm = years_match(a_byr, b_yr, year_tolerance)
            dm = years_match(a_dyr, d_yr, year_tolerance)

            # Surname exact match after normalisation?
            sn_a = row_a["_surname_norm"]
            sn_b = row_b["_surname_norm"]
            same_sn = (sn_a is not None and sn_a == sn_b)

            # Parent overlap
            par_overlap = parent_overlap(row_a.get("famc"), row_b.get("famc"))

            conf, action = confidence_and_action(
                jw_score, bm, dm, same_sn, par_overlap, sx_ok
            )

            rows.append({
                "person_1_id":    id_a,
                "person_1_name":  row_a.get("full_name") or row_a["_name_key"],
                "person_2_id":    id_b,
                "person_2_name":  row_b.get("full_name") or matched_name,
                "birth_year_1":   a_byr,
                "birth_year_2":   b_yr,
                "death_year_1":   a_dyr,
                "death_year_2":   d_yr,
                "birth_match":    bm,
                "death_match":    dm,
                "name_score":     round(jw_score, 1),
                "confidence_level":   conf,
                "recommended_action": action,
                "source_1":       row_a["_source"],
                "source_2":       row_b["_source"],
            })

    if not rows:
        return pd.DataFrame()

    triage = pd.DataFrame(rows)

    # Sort: MERGE first, then HOLD, then REJECT; within group by score desc
    order = {"MERGE": 0, "HOLD": 1, "REJECT": 2}
    triage["_sort_key"] = triage["recommended_action"].map(order)
    triage = (
        triage.sort_values(["_sort_key", "name_score"], ascending=[True, False])
              .drop(columns="_sort_key")
              .reset_index(drop=True)
    )
    return triage


# ── Report ────────────────────────────────────────────────────────────────────

def print_summary(triage: pd.DataFrame) -> None:
    total = len(triage)
    if total == 0:
        print("\n✅ לא נמצאו זוגות פוטנציאליים. / No candidate pairs found.")
        return

    for action in ("MERGE", "HOLD", "REJECT"):
        n = (triage["recommended_action"] == action).sum()
        emoji = {"MERGE": "🔴", "HOLD": "🟡", "REJECT": "🟢"}[action]
        print(f"  {emoji} {action:6s}: {n:4d}")
    print(f"  {'TOTAL':6s}: {total:4d}")

    print("\n── דוגמאות MERGE (הצעת מיזוג) ──────────────────────────────")
    cols = ["person_1_id", "person_1_name", "person_2_id", "person_2_name",
            "birth_match", "name_score"]
    top = triage[triage["recommended_action"] == "MERGE"][cols].head(10)
    if not top.empty:
        print(top.to_string(index=False))
    else:
        print("  (none)")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genealogy duplicate finder — pandas + RapidFuzz"
    )
    parser.add_argument(
        "csv_file",
        help="Primary CSV file (canonical.csv or similar)",
    )
    parser.add_argument(
        "csv_file_b",
        nargs="?",
        default=None,
        help="Optional second CSV to cross-match against (e.g. unconnected_people.csv)",
    )
    parser.add_argument("--output",          default=None,  help="Output CSV path")
    parser.add_argument("--name-threshold",  type=float, default=82,
                        help="Min fuzzy score 0-100 to consider a pair (default: 82)")
    parser.add_argument("--year-tolerance",  type=int, default=3,
                        help="Max year difference for a 'match' (default: 3)")
    parser.add_argument("--same-sex-only",   action="store_true",
                        help="Exclude pairs with conflicting sex values")
    parser.add_argument("--limit",           type=int, default=50_000,
                        help="Max candidate pairs to evaluate (default: 50000)")
    parser.add_argument("--action",
                        choices=["MERGE", "HOLD", "REJECT", "all"],
                        default="all",
                        help="Filter output to one action (default: all)")
    args = parser.parse_args()

    path_a = Path(args.csv_file)
    path_b = Path(args.csv_file_b) if args.csv_file_b else None

    if not path_a.exists():
        print(f"❌ קובץ לא נמצא: {path_a}", file=sys.stderr)
        sys.exit(1)
    if path_b and not path_b.exists():
        print(f"❌ קובץ לא נמצא: {path_b}", file=sys.stderr)
        sys.exit(1)

    # Default output name
    if args.output is None:
        today = date.today().strftime("%Y-%m-%d")
        suffix = f"_vs_{path_b.stem}" if path_b else ""
        args.output = str(path_a.parent / f"duplicates{suffix}_{today}.csv")

    mode = f"cross-file ({path_a.name} ↔ {path_b.name})" if path_b else f"within-file ({path_a.name})"
    print(f"\n🔍 מחפש כפילויות / Finding duplicates — {mode}")
    print(f"   שם-threshold: {args.name_threshold}  |  year-tolerance: ±{args.year_tolerance} שנים")
    print()

    df_a = load_csv(path_a, path_a.stem)
    df_b = load_csv(path_b, path_b.stem) if path_b else None

    triage = find_duplicates(
        df_a, df_b,
        name_threshold=args.name_threshold,
        year_tolerance=args.year_tolerance,
        same_sex_only=args.same_sex_only,
        pair_limit=args.limit,
    )

    if triage.empty:
        print("✅ לא נמצאו זוגות פוטנציאליים.")
        sys.exit(0)

    # Filter by action if requested
    if args.action != "all":
        triage = triage[triage["recommended_action"] == args.action]

    print("\n── סיכום / Summary ──────────────────────────────────────────")
    print_summary(triage)

    triage.to_csv(args.output, index=False, encoding="utf-8-sig")
    print(f"\n💾 נשמר / Saved → {args.output}")
    print(f"   {len(triage)} שורות / rows\n")


if __name__ == "__main__":
    main()
