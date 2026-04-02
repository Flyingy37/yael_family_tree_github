#!/usr/bin/env python3
"""
scan_gems.py

Scans family members in data/canonical.csv for potential matches with
notable historical or public figures ("gems") using fuzzy string matching.

Usage:
    python scripts/scan_gems.py [--threshold N]

    --threshold  Similarity score that a match must exceed (0-100).
                 Defaults to 85.

Falls back to data/sample/canonical.sample.csv when data/canonical.csv
is not present (e.g. in CI without private data).
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CANONICAL_PATH = ROOT / "data" / "canonical.csv"
SAMPLE_PATH = ROOT / "data" / "sample" / "canonical.sample.csv"

# ---------------------------------------------------------------------------
# Famous figures to search for.  Extend this list to add more candidates.
# ---------------------------------------------------------------------------
famous_figures = [
    {"name": "Jacob Castro", "title": "Maharikash - Famous Rabbi of Egypt"},
    {"name": "Yehoshua Kastrel", "title": "Relative of Chaim Nachman Bialik"},
    {"name": "Tamar Gozansky", "title": "Israeli Politician & Public Figure"},
    {"name": "Aryeh Leib Alperovich", "title": "Rabbinical Scribe"},
    {"name": "Miguel Castro", "title": "Sephardic Ancestor (Spain)"},
]


def resolve_csv_path() -> Path:
    """Return the canonical CSV path, falling back to the sample file."""
    if CANONICAL_PATH.exists():
        return CANONICAL_PATH
    if SAMPLE_PATH.exists():
        print(f"Note: {CANONICAL_PATH} not found — using sample data.")
        return SAMPLE_PATH
    raise FileNotFoundError(
        f"Neither {CANONICAL_PATH} nor {SAMPLE_PATH} exist. "
        "Run 'npm run build-graph' to generate data/canonical.csv."
    )


def scan_for_gems(threshold: int = 85) -> list[dict[str, object]]:
    """Return a list of fuzzy matches whose score exceeds *threshold*."""
    from thefuzz import fuzz  # imported here so the module is importable without thefuzz installed

    csv_path = resolve_csv_path()
    matches: list[dict[str, object]] = []

    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            member_name = (row.get("full_name") or "").strip()
            member_id = (row.get("ged_id") or "").strip()
            if not member_name:
                continue

            for figure in famous_figures:
                score = fuzz.token_sort_ratio(member_name, figure["name"])
                if score > threshold:
                    matches.append(
                        {
                            "member_name": member_name,
                            "member_id": member_id,
                            "matched_figure": figure["name"],
                            "significance": figure["title"],
                            "score": score,
                        }
                    )

    return matches


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan family tree for famous-figure matches.")
    parser.add_argument(
        "--threshold",
        type=int,
        default=85,
        help="Report matches whose score exceeds this value (0-100, default: 85).",
    )
    args = parser.parse_args()

    results = scan_for_gems(threshold=args.threshold)

    if results:
        print(f"🔍 Found {len(results)} potential match(es):")
        for r in results:
            print(
                f"💎 Match Found: {r['member_name']} (ID: {r['member_id']}) "
                f"is potentially {r['matched_figure']} — {r['significance']} "
                f"(Score: {r['score']})"
            )
    else:
        print("No matches found. Consider expanding the famous_figures list or lowering --threshold.")


if __name__ == "__main__":
    main()
