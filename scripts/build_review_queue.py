#!/usr/bin/env python3
"""
Build an actionable review queue from extracted update candidates.

Input:
  reports/pdf-update-candidates.csv

Output:
  reports/update-review-queue.csv
"""

from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT_PATH = ROOT / "reports" / "pdf-update-candidates.csv"
OUTPUT_PATH = ROOT / "reports" / "update-review-queue.csv"


def normalize_name(value: str) -> str:
  return " ".join((value or "").lower().split())


def priority_for(confidence: str, category: str) -> str:
  if confidence == "high":
    return "P1"
  if category == "DNA":
    return "P1"
  if category in {"Lineage/Rabbi", "Marriage-network"}:
    return "P2"
  return "P3"


def main() -> None:
  if not INPUT_PATH.exists():
    raise SystemExit(f"Missing input: {INPUT_PATH}")

  rows = list(csv.DictReader(INPUT_PATH.open("r", encoding="utf-8")))
  grouped: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)

  for row in rows:
    key = (
      normalize_name(row.get("candidate_name", "")),
      row.get("category", "").strip(),
      row.get("matched_person_ids", "").strip(),
    )
    grouped[key].append(row)

  queue_rows: list[dict[str, str]] = []
  for (_, category, matched_ids), items in grouped.items():
    best = sorted(
      items,
      key=lambda r: {"high": 0, "medium": 1, "low": 2}.get(r.get("confidence", "low"), 3),
    )[0]
    evidence_sources = sorted({x.get("source_file", "") for x in items if x.get("source_file", "")})
    evidence_snippets = [x.get("evidence_snippet", "") for x in items if x.get("evidence_snippet", "")]
    combined_evidence = " || ".join(evidence_snippets[:2])[:420]

    queue_rows.append(
      {
        "status": "pending",
        "priority": priority_for(best.get("confidence", "low"), category),
        "category": category,
        "candidate_name": best.get("candidate_name", "").strip(),
        "matched_person_ids": matched_ids,
        "confidence": best.get("confidence", "low"),
        "suggested_action": best.get("suggested_action", "").strip(),
        "source_files": " | ".join(evidence_sources),
        "evidence_snippet": combined_evidence,
        "reviewer_notes": "",
      }
    )

  queue_rows.sort(
    key=lambda r: (
      {"P1": 0, "P2": 1, "P3": 2}.get(r["priority"], 3),
      {"DNA": 0, "Lineage/Rabbi": 1, "Marriage-network": 2, "Surname/nee": 3}.get(r["category"], 9),
      r["candidate_name"].lower(),
    )
  )

  OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
  with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
      f,
      fieldnames=[
        "status",
        "priority",
        "category",
        "candidate_name",
        "matched_person_ids",
        "confidence",
        "suggested_action",
        "source_files",
        "evidence_snippet",
        "reviewer_notes",
      ],
    )
    writer.writeheader()
    writer.writerows(queue_rows)

  print(f"Wrote {len(queue_rows)} queue rows -> {OUTPUT_PATH}")


if __name__ == "__main__":
  main()

