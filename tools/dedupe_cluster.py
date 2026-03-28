#!/usr/bin/env python3
"""
dedupe_cluster.py — Entity Resolution with Active Learning
ניטרול כפילויות עם למידה אקטיבית (dedupe)

Uses the `dedupe` library (v3) to find duplicate individuals in the
genealogy CSV via machine-learning-based active learning.

Workflow:
  1. Load CSV → build record dict
  2. Define fields: first_name, last_name, birth_year, spouse_name
  3. Active-learning console session — you label ~10-20 pairs
  4. Train model → cluster all records
  5. Export CSV with new Cluster_ID column

Usage:
    python3 dedupe_cluster.py data/canonical.csv
    python3 dedupe_cluster.py data/canonical.csv --training dedupe_training.json
    python3 dedupe_cluster.py data/canonical.csv --threshold 0.5 --skip-training

Requirements:
    pip install dedupe pandas
"""

import re
import sys
import csv
import json
import argparse
import warnings
from pathlib import Path
from datetime import date

import pandas as pd
import dedupe
from dedupe import variables

warnings.filterwarnings("ignore")


# ── Helpers ────────────────────────────────────────────────────────────────────

YEAR_RE = re.compile(r"\b(1[0-9]{3}|20[0-2][0-9])\b")
NULL_NAMES = {
    "fnu", "lnu", "unknown", "unk", "unnamed", "none",
    "d1", "d2", "d3", "s1", "s2", "s3", "nn", "?", "-", ""
}


def extract_year(raw) -> str | None:
    """Extract first 4-digit year from any date string, or return None."""
    if not raw or (isinstance(raw, float)):
        return None
    m = YEAR_RE.search(str(raw))
    return m.group(0) if m else None


def clean_name(raw) -> str | None:
    """Return lowercase stripped name, or None if meaningless."""
    if not raw or pd.isna(raw):
        return None
    s = re.sub(r"[^\w\s]", " ", str(raw)).strip().lower()
    s = re.sub(r"\s+", " ", s)
    return None if s in NULL_NAMES else (s or None)


# ── CSV loading ────────────────────────────────────────────────────────────────

COLUMN_MAP = {
    # id
    "ged_id": "person_id", "id": "person_id",
    # given
    "given_final": "first_name", "given_name": "first_name",
    "firstname": "first_name", "first_name": "first_name",
    # surname
    "surname_final": "last_name", "surname": "last_name",
    "lastname": "last_name", "family_name": "last_name",
    # dates
    "birth_date": "birth_date", "death_date": "death_date",
    "birth_year": "birth_year", "death_year": "death_year",
    # relationships
    "fams": "fams",   # families as spouse
    "famc": "famc",   # family as child
}


def load_and_prepare(path: Path) -> tuple[pd.DataFrame, dict]:
    """
    Load CSV, normalize columns, build a dedupe-compatible record dict.

    dedupe requires:
        data = { record_id: { field_name: value, ... }, ... }
    where every value is either a string or None (no floats).
    """
    df = pd.read_csv(path, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]

    # Rename aliases (skip if target already exists)
    for src, dst in COLUMN_MAP.items():
        if src in df.columns and dst not in df.columns:
            df = df.rename(columns={src: dst})

    # Ensure minimal columns exist
    if "person_id" not in df.columns:
        df["person_id"] = [f"R{i}" for i in range(len(df))]

    for col in ["first_name", "last_name", "birth_date", "death_date", "fams"]:
        if col not in df.columns:
            df[col] = None

    # Derive birth_year / death_year from date strings if needed
    if "birth_year" not in df.columns:
        df["birth_year"] = df["birth_date"].apply(extract_year)
    if "death_year" not in df.columns:
        df["death_year"] = df["death_date"].apply(extract_year)

    # Build spouse_name: look up all families-as-spouse and collect co-spouses
    # For simplicity we use the fams column as a proxy (exact family ID, not name)
    # A richer version would join back to resolve spouse names — left as extension.
    df["spouse_fams"] = df["fams"].apply(
        lambda x: str(x).strip() if pd.notna(x) and str(x).strip() else None
    )

    # Clean and normalise
    df["_first"]  = df["first_name"].apply(clean_name)
    df["_last"]   = df["last_name"].apply(clean_name)
    df["_byear"]  = df["birth_year"].apply(extract_year)
    df["_dyear"]  = df["death_year"].apply(extract_year)
    df["_spouse"] = df["spouse_fams"]  # family ID string as proxy

    # Build record dict for dedupe
    records: dict = {}
    for _, row in df.iterrows():
        rid = str(row["person_id"])
        records[rid] = {
            "first_name":   row["_first"],
            "last_name":    row["_last"],
            "birth_year":   row["_byear"],
            "death_year":   row["_dyear"],
            "spouse_name":  row["_spouse"],
        }

    return df, records


# ── Field definitions ──────────────────────────────────────────────────────────

def build_fields() -> list:
    """
    Define the comparison fields for dedupe.
    Each field type determines how two values are compared.

    ShortString — character-level similarity (Jaro-Winkler / Levenshtein)
                  best for names with spelling variants
    Exact       — must match exactly (or both null)
                  best for year strings
    Exists      — binary: does the field have any value?
                  adds signal when data is sparse
    """
    return [
        variables.ShortString("first_name",  has_missing=True),
        variables.ShortString("last_name",   has_missing=True),
        variables.Exact(      "birth_year",  has_missing=True),
        variables.Exact(      "death_year",  has_missing=True),
        variables.ShortString("spouse_name", has_missing=True),
        variables.Exists(     "birth_year"),
        variables.Exists(     "last_name"),
    ]


# ── Training session ───────────────────────────────────────────────────────────

def run_training(
    deduper: dedupe.Dedupe,
    records: dict,
    training_file: Path | None,
    skip_training: bool,
) -> None:
    """
    Either load existing training data from file, or run interactive
    active-learning session on the console, then save the results.
    """
    # Load previous labels if file exists
    if training_file and training_file.exists():
        print(f"\n  📚  Loading previous training from {training_file.name} …")
        with open(training_file, "r") as f:
            deduper.prepare_training(records, training_file=f)
    else:
        deduper.prepare_training(records)

    if skip_training:
        print("  ⏩  Skipping interactive training (--skip-training)")
        return

    # ── Interactive console labelling ──────────────────────────────────────
    MIN_LABELS = 5    # dedupe uses 5-fold cross-validation → needs ≥5 of each class

    print()
    print("  " + "─" * 64)
    print("  ACTIVE LEARNING SESSION — Label record pairs")
    print("  " + "─" * 64)
    print(f"""
  For each pair of records shown, type:
    y  — Yes, these are the SAME person  (match / duplicate)
    n  — No, these are DIFFERENT people  (distinct)
    u  — Unsure / skip this pair
    f  — Finished — stop labelling and train the model

  ⚠️  You MUST label at least {MIN_LABELS} 'y' AND {MIN_LABELS} 'n' pairs before
      typing 'f'.  Fewer labels cause a 5-fold cross-validation crash.
  👉  Aim for 10+ of each for best accuracy.
""")
    input("  Press ENTER to begin… ")
    print()

    # Loop until the user has supplied enough labels of each class
    while True:
        dedupe.console_label(deduper)

        n_match    = len(deduper.training_pairs.get("match",    []))
        n_distinct = len(deduper.training_pairs.get("distinct", []))

        print()
        print(f"  📊  Labels so far:  ✅ match={n_match}   ❌ distinct={n_distinct}   "
              f"(need ≥{MIN_LABELS} of each)")

        # All good — enough labels to train safely
        if n_match >= MIN_LABELS and n_distinct >= MIN_LABELS:
            print(f"  ✅  Sufficient labels — proceeding to training.\n")
            break

        # Not enough — warn clearly and loop back into the labeller
        missing = []
        if n_match < MIN_LABELS:
            missing.append(f"{MIN_LABELS - n_match} more 'y' (match) label(s)")
        if n_distinct < MIN_LABELS:
            missing.append(f"{MIN_LABELS - n_distinct} more 'n' (distinct) label(s)")

        print()
        print("  ⛔  Cannot train yet — 5-fold cross-validation requires at least")
        print(f"      {MIN_LABELS} examples of EACH class.  You still need:")
        for m in missing:
            print(f"        • {m}")
        print()
        print("  The labelling session will resume.  Press ENTER to continue…")
        input()
        print()

    # Save training data
    if training_file:
        with open(training_file, "w") as f:
            deduper.write_training(f)
        print(f"  💾  Training data saved → {training_file.name}")


# ── Clustering & export ────────────────────────────────────────────────────────

def cluster_and_export(
    deduper: dedupe.Dedupe,
    records: dict,
    df: pd.DataFrame,
    output_path: Path,
    threshold: float,
) -> None:
    """Train, cluster all records, and export annotated CSV."""

    # ── Pre-train validation ───────────────────────────────────────────────
    # dedupe uses sklearn StratifiedKFold(n_splits=5) internally.
    # It requires n_samples >= 5 for BOTH classes or it raises:
    #   ValueError: Cannot have n_splits=5 > n_samples=N
    MIN_LABELS = 5
    n_match    = len(deduper.training_pairs.get("match",    []))
    n_distinct = len(deduper.training_pairs.get("distinct", []))

    if n_match < MIN_LABELS or n_distinct < MIN_LABELS:
        print()
        print("  ⛔  TRAINING ABORTED — not enough labelled examples.")
        print(f"      match={n_match}  distinct={n_distinct}  (need ≥{MIN_LABELS} of each)")
        print()
        print("  Fix: re-run the script WITHOUT --skip-training and label more pairs.")
        print("       Type 'y' for duplicates, 'n' for distinct, 'f' when done.")
        sys.exit(1)

    print("\n  🧠  Training model …", end=" ", flush=True)
    deduper.train(recall=1.0)
    print("✅")

    print(f"  🔍  Clustering records (threshold={threshold}) …", end=" ", flush=True)
    clustered_dupes = deduper.partition(records, threshold=threshold)
    print("✅")

    # Build cluster_id → person_id mapping
    cluster_map: dict[str, str] = {}      # person_id → cluster_id
    cluster_sizes: dict[str, int] = {}    # cluster_id → size

    for cluster_id, (record_ids, scores) in enumerate(clustered_dupes):
        size = len(record_ids)
        for rid in record_ids:
            cluster_map[rid] = f"C{cluster_id:06d}"
        cluster_sizes[f"C{cluster_id:06d}"] = size

    # Singletons get their own cluster
    next_id = len(clustered_dupes)
    for rid in records:
        if rid not in cluster_map:
            cluster_map[rid] = f"C{next_id:06d}"
            cluster_sizes[f"C{next_id:06d}"] = 1
            next_id += 1

    # Annotate original DataFrame
    out = df.copy()
    out["Cluster_ID"]   = out["person_id"].map(cluster_map)
    out["Cluster_Size"] = out["Cluster_ID"].map(cluster_sizes)

    # Statistics
    total      = len(records)
    multi      = sum(1 for s in cluster_sizes.values() if s > 1)
    dup_people = sum(s for s in cluster_sizes.values() if s > 1)

    print()
    print("  " + "─" * 50)
    print(f"  Total records:             {total:>6}")
    print(f"  Duplicate clusters found:  {multi:>6}")
    print(f"  People in those clusters:  {dup_people:>6}")
    print(f"  Singleton records:         {total - dup_people:>6}")
    print("  " + "─" * 50)

    # Show a sample of duplicate clusters
    if multi:
        print("\n  Sample duplicate clusters:")
        sample_ids = [cid for cid, s in cluster_sizes.items() if s > 1][:5]
        for cid in sample_ids:
            members = out[out["Cluster_ID"] == cid][["person_id", "first_name", "last_name",
                                                       "birth_date"]].head(5)
            print(f"\n  [{cid}]")
            print(members.to_string(index=False))

    # Export
    out.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"\n  💾  Exported → {output_path}")

    # Also export just the clusters with size > 1 for easy review
    dup_path = output_path.with_name(output_path.stem + "_duplicates_only.csv")
    dup_df = out[out["Cluster_Size"] > 1].sort_values(["Cluster_ID", "last_name"])
    dup_df.to_csv(dup_path, index=False, encoding="utf-8-sig")
    print(f"  💾  Duplicates only → {dup_path}")
    print(f"      ({len(dup_df)} rows in {multi} clusters)")


# ── CLI ────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genealogy entity resolution with dedupe active learning"
    )
    parser.add_argument("csv_file",
                        help="Path to the genealogy CSV (canonical.csv)")
    parser.add_argument("--training",
                        default="dedupe_training.json",
                        help="Training JSON file (load/save labels; default: dedupe_training.json)")
    parser.add_argument("--threshold",
                        type=float, default=0.5,
                        help="Clustering confidence threshold 0-1 (default: 0.5; lower = more merges)")
    parser.add_argument("--skip-training",
                        action="store_true",
                        help="Skip interactive labelling — use existing training file only")
    parser.add_argument("--output",
                        default=None,
                        help="Output CSV path (default: <input>_clustered_YYYY-MM-DD.csv)")
    args = parser.parse_args()

    csv_path      = Path(args.csv_file)
    training_path = Path(args.training)

    if not csv_path.exists():
        print(f"❌  File not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    if args.output is None:
        today = date.today().isoformat()
        args.output = str(
            csv_path.parent / f"{csv_path.stem}_clustered_{today}.csv"
        )
    output_path = Path(args.output)

    # ── Load data ──────────────────────────────────────────────────────────
    print(f"\n📂  Loading {csv_path.name} …", end=" ", flush=True)
    df, records = load_and_prepare(csv_path)
    print(f"✅  {len(records)} records")

    # Remove records with no name data (they can't be usefully compared)
    records = {
        k: v for k, v in records.items()
        if v["first_name"] or v["last_name"]
    }
    print(f"    Records with at least one name field: {len(records)}")

    # ── Set up dedupe ──────────────────────────────────────────────────────
    print("\n⚙️   Initialising dedupe …", end=" ", flush=True)
    fields = build_fields()
    deduper = dedupe.Dedupe(fields)
    print("✅")

    # ── Training ───────────────────────────────────────────────────────────
    run_training(deduper, records, training_path, args.skip_training)

    # ── Cluster & export ───────────────────────────────────────────────────
    cluster_and_export(deduper, records, df, output_path, args.threshold)

    print()


if __name__ == "__main__":
    main()
