/**
 * csv-parser — lightweight CSV parsing utilities for browser contexts.
 *
 * The build pipeline uses csv-parse/sync (Node.js); this module provides
 * a minimal alternative for any runtime CSV parsing in the browser.
 */

export interface ParseOptions {
  /** Whether the first row contains column headers. Default: true */
  hasHeader?: boolean;
  /** Column delimiter. Default: ',' */
  delimiter?: string;
  /** Whether to trim whitespace from values. Default: true */
  trim?: boolean;
}

/**
 * Parse a CSV string into an array of row objects.
 * Returns plain string values — no type coercion.
 */
export function parseCsv(
  raw: string,
  options: ParseOptions = {}
): Record<string, string>[] {
  const { hasHeader = true, delimiter = ',', trim = true } = options;

  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  const splitRow = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cells.push(trim ? current.trim() : current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(trim ? current.trim() : current);
    return cells;
  };

  if (!hasHeader) {
    return lines.map(line => {
      const cells = splitRow(line);
      return Object.fromEntries(cells.map((v, i) => [String(i), v]));
    });
  }

  const headers = splitRow(lines[0]);
  return lines.slice(1).map(line => {
    const cells = splitRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}
