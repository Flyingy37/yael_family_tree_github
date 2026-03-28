#!/usr/bin/env python3
"""
Geocode unique place strings from canonical.csv (birth_place column) using
OpenStreetMap Nominatim. Matches build-graph.ts: birth_place uses " | " between
birth and death place subfields.

Usage:
    python3 tools/geocode_locations.py data/canonical.csv
    python3 tools/geocode_locations.py data/canonical.csv --limit 20 --dry-run

Nominatim policy: at most one request per second; a valid User-Agent is required.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Identifiable app string (Nominatim requirement)
USER_AGENT = "LivnatFamilyTreeGeocoder/1.0 (genealogy research; contact via repo)"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
DEFAULT_OUTPUT_DIR = Path.home() / "Documents/LivnatGenealogyWorkspace/00-Cursor-Generated-Outputs"
REQUEST_INTERVAL_SEC = 1.1


def split_pipe_places(value: str) -> tuple[str | None, str | None]:
    """Same as splitPipeField in scripts/build-graph.ts for birth_place."""
    if not value or not value.strip():
        return None, None
    parts = [p.strip() for p in value.split(" | ")]
    birth = parts[0] if parts[0] else None
    death = parts[1] if len(parts) > 1 and parts[1] else None
    return birth, death


def collect_unique_places(csv_path: Path) -> list[str]:
    with csv_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if "birth_place" not in (reader.fieldnames or []):
            raise SystemExit(
                f"CSV missing 'birth_place' column. Found: {reader.fieldnames}"
            )
        seen: set[str] = set()
        ordered: list[str] = []
        for row in reader:
            raw = row.get("birth_place") or ""
            b, d = split_pipe_places(raw)
            for p in (b, d):
                if p and p not in seen:
                    seen.add(p)
                    ordered.append(p)
        return ordered


def nominatim_search(query: str) -> dict | None:
    params = urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": "1"}
    )
    url = f"{NOMINATIM_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
        return {"_error": str(e)}
    if not data:
        return None
    hit = data[0]
    return {
        "lat": hit.get("lat"),
        "lon": hit.get("lon"),
        "display_name": hit.get("display_name"),
        "place_id": hit.get("place_id"),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Geocode places from canonical.csv")
    parser.add_argument(
        "csv_path",
        type=Path,
        help="Path to canonical.csv",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help=f"Output CSV (default: {DEFAULT_OUTPUT_DIR}/place_geocodes_<stem>.csv)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Max number of new geocode requests (0 = no limit)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only list unique places, do not call the API",
    )
    args = parser.parse_args()

    csv_path = args.csv_path.resolve()
    if not csv_path.is_file():
        raise SystemExit(f"File not found: {csv_path}")

    places = collect_unique_places(csv_path)
    print(f"Unique place strings: {len(places)}", file=sys.stderr)

    if args.dry_run:
        for p in places[: args.limit] if args.limit else places:
            print(p)
        return

    out_path = args.output
    if out_path is None:
        DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        out_path = DEFAULT_OUTPUT_DIR / f"place_geocodes_{csv_path.stem}.csv"

    existing: dict[str, dict[str, str]] = {}
    if out_path.is_file():
        with out_path.open(encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                q = (row.get("place_query") or "").strip()
                if q:
                    existing[q] = {k: str(v or "") for k, v in row.items()}

    pending = [p for p in places if p not in existing]
    if args.limit:
        pending = pending[: args.limit]

    for idx, place in enumerate(pending, start=1):
        print(f"[{idx}/{len(pending)}] geocoding: {place[:80]}...", file=sys.stderr)
        result = nominatim_search(place)
        time.sleep(REQUEST_INTERVAL_SEC)
        if result is None:
            row = {
                "place_query": place,
                "lat": "",
                "lon": "",
                "display_name": "",
                "place_id": "",
                "status": "not_found",
            }
        elif "_error" in result:
            row = {
                "place_query": place,
                "lat": "",
                "lon": "",
                "display_name": "",
                "place_id": "",
                "status": f"error:{result['_error']}",
            }
        else:
            row = {
                "place_query": place,
                "lat": str(result.get("lat", "")),
                "lon": str(result.get("lon", "")),
                "display_name": result.get("display_name") or "",
                "place_id": str(result.get("place_id", "")),
                "status": "ok",
            }
        existing[place] = row

    # Full ordered output: all places in original discovery order
    fieldnames = [
        "place_query",
        "lat",
        "lon",
        "display_name",
        "place_id",
        "status",
    ]
    final_rows = []
    for p in places:
        if p in existing:
            final_rows.append(existing[p])
        else:
            final_rows.append(
                {
                    "place_query": p,
                    "lat": "",
                    "lon": "",
                    "display_name": "",
                    "place_id": "",
                    "status": "pending",
                }
            )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(final_rows)

    print(f"Wrote {len(final_rows)} rows to {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
