#!/usr/bin/env python3
"""
entity_resolution_dedupe.py — Entity resolution with dedupe (active learning)

Uses the dedupe library's active-learning loop: you label uncertain record pairs in the
terminal as (y)es same person, (n)o different people, or (u)nsure, then type (f)inished
when done. Training runs only after labeling; the full dataset is then clustered.

Usage:
    python3 entity_resolution_dedupe.py data/canonical.csv
    python3 entity_resolution_dedupe.py data/canonical.csv --threshold 0.55 --training-out training.json

Requirements:
    pip install -r tools/requirements.txt
"""

from __future__ import annotations

import argparse
import sys
import warnings
from datetime import date
from pathlib import Path

import dedupe
import pandas as pd

warnings.filterwarnings("ignore", category=FutureWarning)

# ── Column normalization (aligned with find_duplicates.py) ────────────────────

COLUMN_ALIASES: dict[str, str] = {
    "ged_id": "person_id",
    "id": "person_id",
    "indid": "person_id",
    "given_name": "given_name",
    "given_final": "given_name",
    "givenname": "given_name",
    "firstname": "given_name",
    "first_name": "given_name",
    "surname": "surname",
    "surname_final": "surname",
    "lastname": "surname",
    "last_name": "surname",
    "family_name": "surname",
    "full_name": "full_name",
    "fullname": "full_name",
    "sex": "sex",
    "gender": "sex",
    "birth_date": "birth_date",
    "birthdate": "birth_date",
    "birth_year": "birth_year",
    "death_date": "death_date",
    "deathdate": "death_date",
    "death_year": "death_year",
    "famc": "famc",
    "parents": "famc",
}


def load_csv_as_dedupe_data(path: Path, max_records: int | None) -> tuple[dict[str, dict[str, str]], bool]:
    df = pd.read_csv(path, dtype=str, low_memory=False)
    df.columns = [c.strip().lower() for c in df.columns]

    rename_map: dict[str, str] = {}
    for col in df.columns:
        if col in COLUMN_ALIASES:
            target = COLUMN_ALIASES[col]
            if col != target and target not in df.columns:
                rename_map[col] = target
    df = df.rename(columns=rename_map)
    df = df.loc[:, ~df.columns.duplicated(keep="first")]

    if "person_id" not in df.columns:
        df["person_id"] = [f"row_{i}" for i in range(len(df))]

    if max_records is not None and len(df) > max_records:
        df = df.head(max_records).copy()

    has_full_name = "full_name" in df.columns

    # Fields we expose to dedupe (all string values)
    out: dict[str, dict[str, str]] = {}
    for _, row in df.iterrows():
        pid = str(row["person_id"]).strip()
        if not pid:
            continue
        rec = {
            "given_name": _clean(row.get("given_name")),
            "surname": _clean(row.get("surname")),
            "birth_year": _clean(row.get("birth_year")),
            "death_year": _clean(row.get("death_year")),
            "sex": _clean(row.get("sex")),
            "famc": _clean(row.get("famc")),
        }
        if has_full_name:
            rec["full_name"] = _clean(row.get("full_name"))
        out[pid] = rec

    return out, has_full_name


def _clean(val) -> str:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    s = str(val).strip()
    return "" if s.lower() in ("nan", "none") else s


def build_field_variables(use_full_name: bool) -> list:
    fields = [
        dedupe.variables.String("given_name"),
        dedupe.variables.String("surname"),
        dedupe.variables.String("birth_year"),
        dedupe.variables.String("death_year"),
        dedupe.variables.String("sex"),
        dedupe.variables.String("famc"),
    ]
    if use_full_name:
        fields.insert(0, dedupe.variables.String("full_name"))
    return fields


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genealogy entity resolution with dedupe active learning (terminal labeling)"
    )
    parser.add_argument("csv_file", help="Input CSV (e.g. canonical.csv)")
    parser.add_argument("--output", default=None, help="Output CSV for cluster assignments")
    parser.add_argument(
        "--max-records",
        type=int,
        default=None,
        help="Optional cap on rows (for large files; dedupe.partition is for moderate size)",
    )
    parser.add_argument(
        "--sample-size",
        type=int,
        default=15_000,
        help="prepare_training sample_size (default: 15000)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.5,
        help="partition() similarity threshold 0–1 (default: 0.5)",
    )
    parser.add_argument(
        "--training-in",
        default=None,
        help="Existing training JSON to load (skips labeling if combined with --no-label)",
    )
    parser.add_argument(
        "--training-out",
        default=None,
        help="Write training pairs JSON here after labeling (for reuse)",
    )
    parser.add_argument(
        "--no-label",
        action="store_true",
        help="Skip console_label; requires prior training via --training-in",
    )
    parser.add_argument(
        "--no-full-name",
        action="store_true",
        help="Do not add full_name as a dedupe field",
    )
    args = parser.parse_args()

    path = Path(args.csv_file)
    if not path.exists():
        print(f"❌ File not found: {path}", file=sys.stderr)
        sys.exit(1)

    print("\n📂 Loading CSV into dedupe record format …", flush=True)
    data, has_full_name = load_csv_as_dedupe_data(path, args.max_records)
    if len(data) < 2:
        print("❌ Need at least 2 records.", file=sys.stderr)
        sys.exit(1)
    print(f"   Records: {len(data)}", flush=True)

    use_fn = has_full_name and not args.no_full_name
    fields = build_field_variables(use_full_name=use_fn)
    if use_fn:
        print("   Using full_name field for dedupe.", flush=True)
    deduper = dedupe.Dedupe(fields)

    training_in = Path(args.training_in) if args.training_in else None
    training_fp = training_in.open("r", encoding="utf-8") if training_in and training_in.exists() else None

    try:
        deduper.prepare_training(data, training_file=training_fp, sample_size=args.sample_size)
    finally:
        if training_fp:
            training_fp.close()

    if args.no_label:
        if not training_in or not training_in.exists():
            print("❌ --no-label requires a valid --training-in file.", file=sys.stderr)
            sys.exit(1)
    else:
        print(
            "\n── Active learning ────────────────────────────────────────────────\n"
            "For each pair, answer whether the two rows are the same person.\n"
            "  (y)es   — same entity (duplicate)\n"
            "  (n)o    — different people\n"
            "  (u)nsure — uncertain (dedupe records both possibilities)\n"
            "  (f)inished — stop labeling and train\n"
            "  (p)revious — go back one pair (after first label)\n"
            "Label a representative sample before finishing; more labels usually help.\n"
            "──────────────────────────────────────────────────────────────────\n",
            flush=True,
        )
        dedupe.console_label(deduper)

    n_m = len(deduper.training_pairs["match"])
    n_d = len(deduper.training_pairs["distinct"])
    if n_m == 0 or n_d == 0:
        print(
            "\n❌ dedupe needs at least one positive (y) and one negative (n) example.\n"
            "   Run again and label more pairs, or use a training JSON from a prior run.\n",
            file=sys.stderr,
        )
        sys.exit(1)

    if args.training_out:
        tout = Path(args.training_out)
        tout.parent.mkdir(parents=True, exist_ok=True)
        with tout.open("w", encoding="utf-8") as f:
            deduper.write_training(f)
        print(f"\n💾 Training data written → {tout}")

    print("\n⚙️  Training matcher …", flush=True)
    deduper.train()

    print(f"\n⚙️  Partitioning {len(data)} records (threshold={args.threshold}) …", flush=True)
    clustered = deduper.partition(data, threshold=args.threshold)

    out_path = args.output
    if out_path is None:
        out_path = str(path.parent / f"entity_clusters_{date.today().isoformat()}.csv")

    rows: list[dict] = []
    for cidx, (cluster_ids, scores) in enumerate(clustered):
        ids = tuple(str(x) for x in cluster_ids)
        cluster_label = f"cluster_{cidx}"
        for i, rid in enumerate(ids):
            score = float(scores[i]) if i < len(scores) else float(scores[-1])
            rec = data.get(rid, {})
            rows.append(
                {
                    "cluster_id": cluster_label,
                    "cluster_size": len(ids),
                    "record_id": rid,
                    "confidence": round(score, 4),
                    "given_name": rec.get("given_name", ""),
                    "surname": rec.get("surname", ""),
                    "birth_year": rec.get("birth_year", ""),
                    "death_year": rec.get("death_year", ""),
                }
            )

    # Singletons: records that never appeared in a multi-member cluster
    seen = {r["record_id"] for r in rows}
    for rid, rec in data.items():
        if rid not in seen:
            rows.append(
                {
                    "cluster_id": rid,
                    "cluster_size": 1,
                    "record_id": rid,
                    "confidence": 1.0,
                    "given_name": rec.get("given_name", ""),
                    "surname": rec.get("surname", ""),
                    "birth_year": rec.get("birth_year", ""),
                    "death_year": rec.get("death_year", ""),
                }
            )

    result = pd.DataFrame(rows)
    result = result.sort_values(["cluster_size", "surname", "given_name"], ascending=[False, True, True])
    result.to_csv(out_path, index=False, encoding="utf-8-sig")

    multi = result.drop_duplicates("cluster_id")
    n_clusters = len(multi)
    dups = (multi["cluster_size"] > 1).sum()
    print(f"\n✅ Wrote {len(result)} rows → {out_path}")
    print(f"   Clusters (unique cluster_id): {n_clusters}  |  multi-record clusters: {dups}\n")


if __name__ == "__main__":
    main()
