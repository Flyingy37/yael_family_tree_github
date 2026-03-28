#!/usr/bin/env python3
"""
dm_soundex_cluster.py — Daitch-Mokotoff Soundex Clustering
קיבוץ שמות לפי אלגוריתם Daitch-Mokotoff Soundex

Clusters Eastern European / Ashkenazi Jewish surnames that sound alike
regardless of transcription language (Russian, Polish, Yiddish, English…).

Uses the abydos library (Daitch–Mokotoff): 6-digit codes via DaitchMokotoff.encode().
Surnames that yield multiple DM encodings are linked if any encoding shares the same
prefix key (union–find), matching how DM branching works.

Usage:
    python3 dm_soundex_cluster.py data/canonical.csv
    python3 dm_soundex_cluster.py data/canonical.csv --col surname_final --prefix 4

Options:
    --col       Surname column name (default: auto-detect)
    --prefix N  Use only first N digits of the 6-digit code (default: 6; try 4 for wider net)
    --min-size  Only report clusters with ≥ N members (default: 2)
    --output    Output CSV path (default: dm_clusters_YYYY-MM-DD.csv)

Requirements:
    pip install pandas abydos
"""

import re
import sys
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import date

import pandas as pd
from abydos.phonetic import DaitchMokotoff

# ═══════════════════════════════════════════════════════════════════════════════
#  Daitch–Mokotoff via abydos
# ═══════════════════════════════════════════════════════════════════════════════

_DM = DaitchMokotoff()


def _transliterate(name: str) -> str:
    """Normalize accented letters to ASCII before phonetic coding."""
    _PAIRS = [
        ("Ä", "A"),
        ("Ö", "O"),
        ("Ü", "U"),
        ("ä", "a"),
        ("ö", "o"),
        ("ü", "u"),
        ("À", "A"),
        ("Á", "A"),
        ("Â", "A"),
        ("Ã", "A"),
        ("Å", "A"),
        ("à", "a"),
        ("á", "a"),
        ("â", "a"),
        ("ã", "a"),
        ("å", "a"),
        ("È", "E"),
        ("É", "E"),
        ("Ê", "E"),
        ("Ë", "E"),
        ("è", "e"),
        ("é", "e"),
        ("ê", "e"),
        ("ë", "e"),
        ("Ì", "I"),
        ("Í", "I"),
        ("Î", "I"),
        ("Ï", "I"),
        ("ì", "i"),
        ("í", "i"),
        ("î", "i"),
        ("ï", "i"),
        ("Ò", "O"),
        ("Ó", "O"),
        ("Ô", "O"),
        ("Õ", "O"),
        ("ò", "o"),
        ("ó", "o"),
        ("ô", "o"),
        ("õ", "o"),
        ("Ù", "U"),
        ("Ú", "U"),
        ("Û", "U"),
        ("ù", "u"),
        ("ú", "u"),
        ("û", "u"),
        ("Ý", "Y"),
        ("ý", "y"),
        ("Ñ", "N"),
        ("ñ", "n"),
        ("Ç", "C"),
        ("ç", "c"),
        ("Ł", "L"),
        ("ł", "l"),
        ("Ś", "S"),
        ("ś", "s"),
        ("Ź", "Z"),
        ("ź", "z"),
        ("Ż", "Z"),
        ("ż", "z"),
        ("Ń", "N"),
        ("ń", "n"),
        ("Ő", "O"),
        ("ő", "o"),
        ("Ű", "U"),
        ("ű", "u"),
        ("Š", "S"),
        ("š", "s"),
        ("Ž", "Z"),
        ("ž", "z"),
        ("Č", "C"),
        ("č", "c"),
        ("Ć", "C"),
        ("ć", "c"),
        ("Đ", "D"),
        ("đ", "d"),
    ]
    _FROM = "".join(p[0] for p in _PAIRS)
    _TO = "".join(p[1] for p in _PAIRS)
    _MAP = str.maketrans(_FROM, _TO)
    name = name.translate(_MAP)
    name = re.sub(r"[^A-Za-z\s'-]", "", name)
    return name


def _prepare_surname_token(name: str) -> str:
    """Uppercase, first hyphenated/space token only (compound surnames), letters only."""
    if not name or not isinstance(name, str):
        return ""
    name = _transliterate(name).upper()
    name = re.sub(r"[\s'-].*", "", name)
    name = re.sub(r"[^A-Z]", "", name)
    return name


def surname_dm_codes(name: str) -> set[str]:
    """All 6-digit Daitch–Mokotoff codes abydos assigns to this surname (may be >1)."""
    token = _prepare_surname_token(name)
    if not token:
        return {"000000"}
    return set(_DM.encode(token))


def surname_dm_primary(name: str) -> str:
    """Deterministic primary code (lexicographic min) for CSV columns."""
    codes = surname_dm_codes(name)
    return min(codes)


# ── Quick self-test ────────────────────────────────────────────────────────────


def _run_self_tests() -> None:
    """Smoke-test well-known DM Soundex prefixes (abydos)."""
    cases = [
        ("Shapiro", "4790"),
        ("Schapiro", "4790"),
        ("Shapira", "4790"),
        ("Alperovich", "0879"),
        ("Alperovitz", "0879"),
        ("Alperovitch", "0879"),
        ("Alperovitsh", "0879"),
        ("Alperowitz", "0879"),
        ("Alperowich", "0879"),
        ("Alperowicz", "0879"),
        ("Moskowitz", "6457"),
        ("Moskovitch", "6457"),
        ("Rabinowitz", "9767"),
        ("Rabinovich", "9767"),
        ("Bernstein", "7964"),
        ("Bernshtein", "7964"),
    ]
    failures = []
    for name, expected in cases:
        got = surname_dm_primary(name)
        if not got.startswith(expected):
            failures.append(f"  {name!r}: expected prefix {expected!r}, got {got!r}")
    if failures:
        print("⚠️  Self-test failures:")
        for f in failures:
            print(f)
    else:
        print(f"✅  Self-test passed ({len(cases)} cases)")


# ═══════════════════════════════════════════════════════════════════════════════
#  Union–find for clustering on shared DM prefix (any variant code)
# ═══════════════════════════════════════════════════════════════════════════════


class UnionFind:
    def __init__(self, n: int) -> None:
        self._p = list(range(n))

    def find(self, x: int) -> int:
        while self._p[x] != x:
            self._p[x] = self._p[self._p[x]]
            x = self._p[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self._p[rb] = ra


# ═══════════════════════════════════════════════════════════════════════════════
#  CSV loading & column detection
# ═══════════════════════════════════════════════════════════════════════════════

SURNAME_COL_CANDIDATES = [
    "surname_final",
    "surname",
    "last_name",
    "family_name",
    "lastname",
    "familyname",
]
ID_COL_CANDIDATES = ["ged_id", "id", "person_id", "indid"]
GIVEN_COL_CANDIDATES = ["given_final", "given_name", "first_name", "firstname"]


def _detect_col(df: pd.DataFrame, candidates: list[str]) -> str | None:
    cols_lower = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in cols_lower:
            return cols_lower[cand]
    return None


def load_csv(path: Path, surname_col: str | None) -> tuple[pd.DataFrame, str, str, str | None]:
    """
    Load CSV, auto-detect key columns.
    Returns (df, id_col, surname_col, given_col).
    """
    df = pd.read_csv(path, dtype=str, low_memory=False)

    id_col = _detect_col(df, ID_COL_CANDIDATES) or df.columns[0]

    if surname_col:
        if surname_col not in df.columns:
            raise ValueError(f"Column '{surname_col}' not found. Available: {df.columns.tolist()}")
        sn_col = surname_col
    else:
        sn_col = _detect_col(df, SURNAME_COL_CANDIDATES)
        if sn_col is None:
            raise ValueError(
                f"Cannot detect surname column. Please specify with --col. "
                f"Available: {df.columns.tolist()}"
            )

    given_col = _detect_col(df, GIVEN_COL_CANDIDATES)
    return df, id_col, sn_col, given_col


# ═══════════════════════════════════════════════════════════════════════════════
#  Clustering & reporting
# ═══════════════════════════════════════════════════════════════════════════════


def cluster_by_dm(
    df: pd.DataFrame,
    id_col: str,
    sn_col: str,
    given_col: str | None,
    prefix: int,
    min_size: int,
) -> pd.DataFrame:
    """
    Compute DM codes, union rows that share any DM prefix (across encoding variants).
    Returns a summary DataFrame with one row per variant spelling group.
    """
    working = df[[id_col, sn_col]].copy()
    if given_col:
        working["_given"] = df[given_col].fillna("")

    working = working[working[sn_col].notna() & (working[sn_col].str.strip() != "")]
    working = working.reset_index(drop=True)

    n = len(working)
    if n == 0:
        return pd.DataFrame()

    uf = UnionFind(n)
    key_to_indices: dict[str, list[int]] = defaultdict(list)

    for i in range(n):
        raw_sn = working.iloc[i][sn_col]
        codes = surname_dm_codes(str(raw_sn))
        for code in codes:
            dm_key = code[:prefix] if prefix <= len(code) else code.ljust(prefix, "0")[:prefix]
            key_to_indices[dm_key].append(i)

    for indices in key_to_indices.values():
        root = indices[0]
        for j in indices[1:]:
            uf.union(root, j)

    working["cluster_root"] = [uf.find(i) for i in range(n)]
    working["dm_code"] = working[sn_col].apply(lambda x: surname_dm_primary(str(x)))
    working["dm_key"] = working["dm_code"].str[:prefix]

    cluster_rows = []
    for _, grp in working.groupby("cluster_root"):
        variant_counts = grp[sn_col].value_counts()
        if variant_counts.empty:
            continue
        n_variants = len(variant_counts)
        n_people = len(grp)
        if n_people < min_size:
            continue

        primary_name = variant_counts.index[0]
        dm_key = sorted(grp["dm_key"].unique())[0]

        cluster_rows.append(
            {
                "dm_key": dm_key,
                "dm_code_sample": grp["dm_code"].iloc[0],
                "primary_name": primary_name,
                "variant_count": n_variants,
                "total_people": n_people,
                "all_variants": " | ".join(f"{name} ({cnt})" for name, cnt in variant_counts.items()),
            }
        )

    summary = pd.DataFrame(cluster_rows)
    if summary.empty:
        return summary

    summary = summary.sort_values(["total_people", "variant_count"], ascending=False).reset_index(drop=True)
    return summary


def annotate_original(df: pd.DataFrame, sn_col: str, prefix: int) -> pd.DataFrame:
    """Add dm_code (primary), dm_codes_all, and dm_key columns."""
    df = df.copy()

    def codes_cell(x) -> str:
        if pd.isna(x) or str(x).strip() == "":
            return "000000"
        return "|".join(sorted(surname_dm_codes(str(x))))

    df["dm_code"] = df[sn_col].apply(
        lambda x: surname_dm_primary(str(x)) if pd.notna(x) and str(x).strip() else "000000"
    )
    df["dm_codes_all"] = df[sn_col].apply(
        lambda x: codes_cell(x) if pd.notna(x) else "000000"
    )
    df["dm_key"] = df["dm_code"].str[:prefix]
    return df


# ═══════════════════════════════════════════════════════════════════════════════
#  Console report
# ═══════════════════════════════════════════════════════════════════════════════


def print_report(summary: pd.DataFrame, prefix: int, top_n: int = 30) -> None:
    print()
    print("═" * 70)
    print(f"  Daitch-Mokotoff Soundex — Surname Cluster Report  (prefix={prefix}, abydos)")
    print("═" * 70)
    print(f"  Total phonetic clusters (≥2 members): {len(summary)}")
    multi = summary[summary["variant_count"] > 1]
    print(f"  Clusters with >1 spelling variant:    {len(multi)}")
    print(f"  Total people in clustered surnames:   {summary['total_people'].sum()}")
    print()

    print(f"  Top {min(top_n, len(summary))} clusters by size:")
    print("  " + "─" * 66)
    print(f"  {'DM Key':<9} {'Primary Name':<22} {'Variants':>8} {'People':>7}")
    print("  " + "─" * 66)

    for _, row in summary.head(top_n).iterrows():
        flag = "★" if row["variant_count"] > 1 else " "
        print(
            f"  {flag}{row['dm_key']:<8} "
            f"{row['primary_name']:<22} "
            f"{row['variant_count']:>8} "
            f"{row['total_people']:>7}"
        )

    print()
    print("  ★ = cluster has multiple spelling variants")
    print()

    interesting = summary[summary["variant_count"] >= 2].head(20)
    if not interesting.empty:
        print("  Detailed view — clusters with ≥2 spelling variants:")
        print("  " + "─" * 66)
        for _, row in interesting.iterrows():
            print(
                f"\n  [{row['dm_key']}]  {row['primary_name']}  "
                f"({row['variant_count']} spellings, {row['total_people']} people)"
            )
            for variant_info in row["all_variants"].split(" | "):
                print(f"    • {variant_info}")

    print()


# ═══════════════════════════════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════════════════════════════


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Daitch-Mokotoff Soundex — surname clustering for genealogy CSVs (abydos)"
    )
    parser.add_argument(
        "csv_file",
        nargs="?",
        default=None,
        help="Path to the genealogy CSV file (not required with --self-test)",
    )
    parser.add_argument("--col", default=None, help="Surname column name (auto-detected if omitted)")
    parser.add_argument(
        "--prefix",
        type=int,
        default=6,
        help="Use first N digits of 6-digit DM code (default: 6; try 4 for wider clusters)",
    )
    parser.add_argument(
        "--min-size",
        type=int,
        default=2,
        help="Minimum people in a cluster to include in report (default: 2)",
    )
    parser.add_argument("--output", default=None, help="Output CSV path")
    parser.add_argument("--self-test", action="store_true", help="Run algorithm self-tests and exit")
    args = parser.parse_args()

    if args.self_test:
        _run_self_tests()
        return

    if not args.csv_file:
        print("❌ csv_file is required unless --self-test", file=sys.stderr)
        sys.exit(1)

    csv_path = Path(args.csv_file)
    if not csv_path.exists():
        print(f"❌ File not found: {csv_path}", file=sys.stderr)
        sys.exit(1)

    if args.output is None:
        today = date.today().isoformat()
        args.output = str(csv_path.parent / f"dm_clusters_{today}.csv")

    print(f"\n📂  Loading {csv_path.name} …", end=" ", flush=True)
    df, id_col, sn_col, given_col = load_csv(csv_path, args.col)
    print(f"✅  {len(df)} rows | surname column: '{sn_col}'")

    print(f"🔢  Computing DM Soundex via abydos (prefix={args.prefix}) …", end=" ", flush=True)
    summary = cluster_by_dm(df, id_col, sn_col, given_col, args.prefix, args.min_size)
    print("✅")

    print_report(summary, args.prefix)

    annotated = annotate_original(df, sn_col, args.prefix)
    annotated.to_csv(args.output, index=False, encoding="utf-8-sig")

    summary_path = str(Path(args.output).with_name(Path(args.output).stem + "_summary.csv"))
    summary.to_csv(summary_path, index=False, encoding="utf-8-sig")

    print(f"💾  Annotated file → {args.output}")
    print(f"💾  Cluster summary → {summary_path}\n")


if __name__ == "__main__":
    main()
