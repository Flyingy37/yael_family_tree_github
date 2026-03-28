#!/usr/bin/env python3
"""
merge_duplicates.py — Safe Genealogy Merge & ID Remapping
מיזוג כפילויות ושינוי מזהים בבסיס נתוני האילן

Reads the triage CSV produced by find_duplicates.py, merges MERGE-flagged
pairs, fills missing fields from the secondary record, concatenates notes,
remaps relationship IDs (fams / famc), and exports a clean canonical_merged.csv.

Usage:
    python3 merge_duplicates.py \\
        --canonical  data/canonical.csv \\
        --secondary  data/unconnected_people.csv \\
        --triage     data/duplicates_vs_unconnected_people_2026-03-28.csv \\
        --output     data/canonical_merged.csv

    # Without a secondary file (within-file merge):
    python3 merge_duplicates.py \\
        --canonical  data/canonical.csv \\
        --triage     data/duplicates_2026-03-28.csv
"""

import re
import sys
import argparse
from pathlib import Path
from datetime import date

import pandas as pd


# ── Column configuration ───────────────────────────────────────────────────────

# Columns that can be "filled in" from the secondary record when primary is null
FILLABLE_COLS = [
    "birth_date", "birth_place",
    "death_date", "death_place",
    "sex",
    "titl",
    "birth_year", "death_year",   # if present
]

# Columns whose content should be concatenated (notes)
CONCAT_COLS = ["note", "note_plain"]

# Columns holding pipe-separated or single GEDCOM xrefs to remap
XREF_COLS = ["fams", "famc"]

# Separator used in multi-value relationship columns
XREF_SEP_RE = re.compile(r"[|,]")


# ── CSV loading ────────────────────────────────────────────────────────────────

COLUMN_ALIASES = {
    "ged_id": "person_id",
    "id": "person_id",
}


def load_csv(path: Path, label: str = "") -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str, low_memory=False)
    df.columns = [c.strip() for c in df.columns]
    df = df.rename(columns={c: COLUMN_ALIASES[c] for c in df.columns if c in COLUMN_ALIASES})
    if "person_id" not in df.columns:
        df["person_id"] = [f"R{i}" for i in range(len(df))]
    df["_source"] = label or path.stem
    return df


# ── Merging helpers ────────────────────────────────────────────────────────────

def coalesce(primary_val, secondary_val) -> str | None:
    """Return primary if non-null, else secondary."""
    if pd.notna(primary_val) and str(primary_val).strip():
        return primary_val
    if pd.notna(secondary_val) and str(secondary_val).strip():
        return secondary_val
    return None


def concat_notes(primary_val, secondary_val, sep: str = " | ") -> str | None:
    """Concatenate two note strings, deduplicating identical content."""
    parts = []
    for v in (primary_val, secondary_val):
        if pd.notna(v) and str(v).strip():
            s = str(v).strip()
            if s not in parts:
                parts.append(s)
    return sep.join(parts) if parts else None


def remap_xref_col(value: str | None, remap: dict[str, str]) -> str | None:
    """
    Replace obsolete IDs with surviving IDs in a pipe/comma-separated xref column.

    e.g.  "@F001@|@F204@"  →  "@F001@|@F204@"   (no change if no obsolete IDs)
          "@I123@"          →  "@I456@"            (obsolete → surviving)
    """
    if not value or pd.isna(value):
        return value

    tokens = [t.strip() for t in XREF_SEP_RE.split(str(value)) if t.strip()]
    remapped = [remap.get(t, t) for t in tokens]
    # Deduplicate while preserving order
    seen: set = set()
    unique = []
    for t in remapped:
        if t not in seen:
            seen.add(t)
            unique.append(t)
    return "|".join(unique)


# ── Main merge routine ─────────────────────────────────────────────────────────

def run_merge(
    df: pd.DataFrame,
    triage: pd.DataFrame,
) -> tuple[pd.DataFrame, dict]:
    """
    Process all MERGE-flagged pairs and return the merged DataFrame + stats.

    Strategy:
    - person_1_id  → surviving (Primary)   — kept in the dataset
    - person_2_id  → obsolete  (Secondary) — absorbed into Primary, then dropped
    """
    # Index by person_id for fast lookup
    idx = df.set_index("person_id", drop=False)

    # Only process MERGE rows
    merge_pairs = triage[triage["recommended_action"] == "MERGE"].copy()

    stats = {
        "pairs_attempted":  len(merge_pairs),
        "pairs_merged":     0,
        "pairs_skipped":    0,
        "fields_enriched":  0,
        "notes_combined":   0,
        "xref_remaps":      0,
    }

    # Build obsolete→surviving map (for ID remapping later)
    remap: dict[str, str] = {}

    print(f"\n  Processing {len(merge_pairs)} MERGE pairs …\n")

    for _, row in merge_pairs.iterrows():
        surviving_id = str(row["person_1_id"])
        obsolete_id  = str(row["person_2_id"])

        # Guard: both IDs must exist in the working dataset
        if surviving_id not in idx.index:
            print(f"  ⚠️  SKIP — surviving id not found: {surviving_id}")
            stats["pairs_skipped"] += 1
            continue
        if obsolete_id not in idx.index:
            print(f"  ⚠️  SKIP — obsolete id not found:  {obsolete_id}")
            stats["pairs_skipped"] += 1
            continue

        # Guard: skip circular or already-remapped IDs
        if surviving_id == obsolete_id:
            stats["pairs_skipped"] += 1
            continue
        if obsolete_id in remap.values():
            print(f"  ⚠️  SKIP — {obsolete_id} was already absorbed into another record")
            stats["pairs_skipped"] += 1
            continue

        primary   = idx.loc[surviving_id].copy()
        secondary = idx.loc[obsolete_id].copy()

        pname = str(primary.get("full_name", surviving_id))
        sname = str(secondary.get("full_name", obsolete_id))
        print(f"  ✅  MERGE  {surviving_id} ({pname})  ←  {obsolete_id} ({sname})")

        # ── Fill missing fields from secondary ──────────────────────────────
        for col in FILLABLE_COLS:
            if col not in idx.columns:
                continue
            filled = coalesce(primary.get(col), secondary.get(col))
            if filled != primary.get(col) and pd.notna(filled):
                print(f"       + enriched '{col}': {secondary.get(col)!r}")
                idx.at[surviving_id, col] = filled
                stats["fields_enriched"] += 1

        # ── Concatenate notes ────────────────────────────────────────────────
        for col in CONCAT_COLS:
            if col not in idx.columns:
                continue
            combined = concat_notes(primary.get(col), secondary.get(col))
            if combined and combined != primary.get(col):
                idx.at[surviving_id, col] = combined
                stats["notes_combined"] += 1

        # ── Register remap ───────────────────────────────────────────────────
        remap[obsolete_id] = surviving_id
        stats["pairs_merged"] += 1

    # ── ID remapping across all xref columns ──────────────────────────────────
    print(f"\n  Remapping {len(remap)} obsolete IDs across relationship columns …")
    for col in XREF_COLS:
        if col not in idx.columns:
            continue
        original = idx[col].copy()
        idx[col] = idx[col].apply(lambda v: remap_xref_col(v, remap))
        changed = (original != idx[col]).sum()
        if changed:
            print(f"    • {col}: {changed} cells updated")
            stats["xref_remaps"] += changed

    # ── Drop obsolete rows ────────────────────────────────────────────────────
    ids_to_drop = set(remap.keys())
    out = idx[~idx["person_id"].isin(ids_to_drop)].copy()
    print(f"\n  Dropped {len(ids_to_drop)} obsolete rows.")

    return out.reset_index(drop=True), stats


# ── Report ─────────────────────────────────────────────────────────────────────

def print_stats(stats: dict, before: int, after: int) -> None:
    print()
    print("═" * 55)
    print("  Merge Summary")
    print("═" * 55)
    print(f"  Records before merge:       {before:>6}")
    print(f"  Records after merge:        {after:>6}")
    print(f"  Pairs in MERGE triage:      {stats['pairs_attempted']:>6}")
    print(f"  Successfully merged:        {stats['pairs_merged']:>6}")
    print(f"  Skipped (ID not found):     {stats['pairs_skipped']:>6}")
    print(f"  Fields enriched (backfill): {stats['fields_enriched']:>6}")
    print(f"  Note columns combined:      {stats['notes_combined']:>6}")
    print(f"  Relationship links remapped:{stats['xref_remaps']:>6}")
    print("═" * 55)


# ── CLI ────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genealogy duplicate merger with ID remapping"
    )
    parser.add_argument("--canonical",  required=True,
                        help="Primary CSV (canonical.csv)")
    parser.add_argument("--secondary",  default=None,
                        help="Optional secondary CSV to merge in (unconnected_people.csv)")
    parser.add_argument("--triage",     required=True,
                        help="Triage CSV from find_duplicates.py")
    parser.add_argument("--output",     default=None,
                        help="Output path (default: canonical_merged_YYYY-MM-DD.csv)")
    parser.add_argument("--action",
                        default="MERGE",
                        help="Which recommended_action value to process (default: MERGE)")
    args = parser.parse_args()

    canonical_path = Path(args.canonical)
    triage_path    = Path(args.triage)

    for p in (canonical_path, triage_path):
        if not p.exists():
            print(f"❌  File not found: {p}", file=sys.stderr)
            sys.exit(1)

    today = date.today().isoformat()
    if args.output is None:
        args.output = str(canonical_path.parent / f"canonical_merged_{today}.csv")

    # ── Load canonical ─────────────────────────────────────────────────────
    print(f"\n📂  Loading {canonical_path.name} …", end=" ", flush=True)
    df_canonical = load_csv(canonical_path, "canonical")
    print(f"✅  {len(df_canonical)} rows")

    # ── Load secondary (optional) ──────────────────────────────────────────
    if args.secondary:
        secondary_path = Path(args.secondary)
        if not secondary_path.exists():
            print(f"❌  Secondary file not found: {secondary_path}", file=sys.stderr)
            sys.exit(1)
        print(f"📂  Loading {secondary_path.name} …", end=" ", flush=True)
        df_secondary = load_csv(secondary_path, "unconnected")
        print(f"✅  {len(df_secondary)} rows")

        # Combine into one working DataFrame (align columns)
        df_combined = pd.concat(
            [df_canonical, df_secondary], ignore_index=True, sort=False
        )
        print(f"    Combined working set: {len(df_combined)} rows")
    else:
        df_combined = df_canonical.copy()

    # ── Load triage ────────────────────────────────────────────────────────
    print(f"📂  Loading triage {triage_path.name} …", end=" ", flush=True)
    triage = pd.read_csv(triage_path, dtype=str, low_memory=False)
    # Normalise recommended_action
    if "recommended_action" not in triage.columns:
        print(f"\n❌  Triage file must have a 'recommended_action' column.", file=sys.stderr)
        sys.exit(1)
    triage["recommended_action"] = triage["recommended_action"].str.upper().str.strip()
    n_merge = (triage["recommended_action"] == args.action).sum()
    print(f"✅  {len(triage)} rows, {n_merge} flagged as {args.action!r}")

    # ── Merge ──────────────────────────────────────────────────────────────
    before = len(df_combined)
    df_out, stats = run_merge(df_combined, triage)
    after = len(df_out)

    # ── Remove internal helper column ──────────────────────────────────────
    df_out = df_out.drop(columns=["_source"], errors="ignore")

    # ── Export ─────────────────────────────────────────────────────────────
    df_out.to_csv(args.output, index=False, encoding="utf-8-sig")

    # ── Summary ────────────────────────────────────────────────────────────
    print_stats(stats, before, after)
    print(f"\n💾  Saved → {args.output}")
    print(f"    {after} individuals in merged dataset\n")


if __name__ == "__main__":
    main()
