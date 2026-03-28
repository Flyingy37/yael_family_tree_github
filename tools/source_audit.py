#!/usr/bin/env python3
"""
source_audit.py — ביקורת מקורות לאילן יוחסין
Source Citation Audit for Family Tree GEDCOM files.

Loads a GEDCOM 7 file and prints all individuals who have fewer than
2 independent source citations supporting their birth or death data.

Usage:
    python3 source_audit.py path/to/file.ged [--min-sources N] [--event birth|death|both]

Requirements:
    pip install gedcom7
"""

import sys
import argparse
from pathlib import Path
from dataclasses import dataclass, field

import gedcom7.parser as gedcom_parser


# ── Data model ────────────────────────────────────────────────────────────────

@dataclass
class EventAudit:
    """Source citations found for a single event (birth or death)."""
    has_event: bool = False          # Does the event tag exist at all?
    source_xrefs: set[str] = field(default_factory=set)   # Linked @S…@ source records
    inline_count: int = 0            # Inline / free-text citations (no xref)

    @property
    def independent_count(self) -> int:
        """Number of independent sources (linked records + inline citations)."""
        return len(self.source_xrefs) + self.inline_count


@dataclass
class IndividualAudit:
    xref: str
    name: str
    birth: EventAudit = field(default_factory=EventAudit)
    death: EventAudit = field(default_factory=EventAudit)

    def is_flagged(self, min_sources: int, check_birth: bool, check_death: bool) -> bool:
        """Return True if this individual needs attention."""
        if check_birth and self.birth.independent_count < min_sources:
            return True
        if check_death and self.death.independent_count < min_sources:
            return True
        return False


# ── GEDCOM parsing ────────────────────────────────────────────────────────────

def extract_name(indi_record) -> str:
    """Extract a readable name from an INDI record."""
    for child in indi_record.children:
        if child.tag == "NAME":
            # GEDCOM name format: "Given /Surname/" — remove slashes
            raw = child.text or ""
            return raw.replace("/", "").strip() or "(שם לא ידוע / Unknown)"
    return "(שם לא ידוע / Unknown)"


def collect_sources(event_record) -> tuple[set[str], int]:
    """
    Collect source citations from an event record's children.

    Returns:
        (xrefs, inline_count)
        xrefs       — set of @Sxxx@ pointer strings (linked source records)
        inline_count — number of inline text-only citations (no pointer)
    """
    xrefs: set[str] = set()
    inline_count = 0
    for child in event_record.children:
        if child.tag == "SOUR":
            if child.xref and child.xref.startswith("@"):
                xrefs.add(child.xref)
            elif child.text:
                # Inline source: free text, no @pointer@
                inline_count += 1
    return xrefs, inline_count


def audit_gedcom(gedcom_path: Path) -> list[IndividualAudit]:
    """
    Parse a GEDCOM file and return one IndividualAudit per INDI record.
    """
    text = gedcom_path.read_text(encoding="utf-8-sig", errors="replace")
    records = gedcom_parser.loads(text)

    results: list[IndividualAudit] = []

    for record in records:
        if record.tag != "INDI":
            continue

        xref = record.pointer or record.xref or "?"
        audit = IndividualAudit(
            xref=xref,
            name=extract_name(record),
        )

        for child in record.children:
            if child.tag == "BIRT":
                audit.birth.has_event = True
                srcs, inline = collect_sources(child)
                audit.birth.source_xrefs = srcs
                audit.birth.inline_count = inline

            elif child.tag == "DEAT":
                audit.death.has_event = True
                srcs, inline = collect_sources(child)
                audit.death.source_xrefs = srcs
                audit.death.inline_count = inline

        results.append(audit)

    return results


# ── Reporting ─────────────────────────────────────────────────────────────────

def format_sources(event: EventAudit, label: str) -> str:
    """Format a one-line summary for an event's sources."""
    if not event.has_event:
        return f"  {label}: ❌ אין רישום / No event recorded"
    count = event.independent_count
    detail_parts = []
    if event.source_xrefs:
        detail_parts.append(f"מקורות מקושרים: {', '.join(sorted(event.source_xrefs))}")
    if event.inline_count:
        detail_parts.append(f"ציטוטים בטקסט: {event.inline_count}")
    if not detail_parts:
        detail_parts.append("אין ציטוטים / no citations")
    icon = "✅" if count >= 2 else "⚠️"
    return f"  {label}: {icon} {count} מקור/ות — {'; '.join(detail_parts)}"


def print_report(
    flagged: list[IndividualAudit],
    total: int,
    min_sources: int,
    check_birth: bool,
    check_death: bool,
) -> None:
    print()
    print("=" * 65)
    print("  ביקורת מקורות — Source Citation Audit")
    print("=" * 65)
    print(f"  סף מינימלי / Min independent sources required: {min_sources}")
    events_checked = []
    if check_birth:
        events_checked.append("לידה / Birth")
    if check_death:
        events_checked.append("פטירה / Death")
    print(f"  אירועים / Events checked: {', '.join(events_checked)}")
    print(f"  סה\"כ יחידים בקובץ / Total individuals: {total}")
    print(f"  נדגלו / Flagged: {len(flagged)}")
    print("=" * 65)
    print()

    if not flagged:
        print("  ✅ כל היחידים עומדים בדרישות המקורות.")
        print("  ✅ All individuals meet the source requirements.")
        return

    for person in sorted(flagged, key=lambda p: p.name.lower()):
        print(f"  {person.xref}  {person.name}")
        if check_birth:
            print(format_sources(person.birth, "לידה  / Birth"))
        if check_death:
            print(format_sources(person.death, "פטירה / Death"))
        print()

    print("-" * 65)
    print(f"  סה\"כ נדגלו / Total flagged: {len(flagged)} מתוך / of {total}")
    print()


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="ביקורת מקורות GEDCOM — Source Citation Audit"
    )
    parser.add_argument(
        "gedcom_file",
        help="Path to the .ged GEDCOM file",
    )
    parser.add_argument(
        "--min-sources",
        type=int,
        default=2,
        metavar="N",
        help="Minimum independent sources required (default: 2)",
    )
    parser.add_argument(
        "--event",
        choices=["birth", "death", "both"],
        default="both",
        help="Which event to audit (default: both)",
    )
    parser.add_argument(
        "--output",
        choices=["full", "names-only"],
        default="full",
        help="Output verbosity (default: full)",
    )
    args = parser.parse_args()

    gedcom_path = Path(args.gedcom_file)
    if not gedcom_path.exists():
        print(f"❌ קובץ לא נמצא / File not found: {gedcom_path}", file=sys.stderr)
        sys.exit(1)

    check_birth = args.event in ("birth", "both")
    check_death = args.event in ("death", "both")

    print(f"טוען / Loading: {gedcom_path.name} …", end=" ", flush=True)
    try:
        all_audits = audit_gedcom(gedcom_path)
    except Exception as exc:
        print(f"\n❌ שגיאה בניתוח הקובץ / Parse error: {exc}", file=sys.stderr)
        sys.exit(1)
    print(f"✅  ({len(all_audits)} individuals)")

    flagged = [
        a for a in all_audits
        if a.is_flagged(args.min_sources, check_birth, check_death)
    ]

    if args.output == "names-only":
        for person in sorted(flagged, key=lambda p: p.name.lower()):
            birth_n = person.birth.independent_count
            death_n = person.death.independent_count
            print(f"{person.xref}\t{person.name}\tלידה:{birth_n}\tפטירה:{death_n}")
    else:
        print_report(flagged, len(all_audits), args.min_sources, check_birth, check_death)


if __name__ == "__main__":
    main()
