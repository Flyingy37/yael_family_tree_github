import { describe, it, expect } from 'vitest';
import { parseCsv } from './csv-parser';

describe('parseCsv – header mode (default)', () => {
  it('parses a simple two-column CSV', () => {
    const csv = 'name,age\nAlice,30\nBob,25';
    expect(parseCsv(csv)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('returns an empty array for only-whitespace input', () => {
    expect(parseCsv('   \n  ')).toEqual([]);
  });

  it('handles a header-only CSV (no data rows)', () => {
    expect(parseCsv('name,age')).toEqual([]);
  });

  it('trims whitespace from values by default', () => {
    const csv = 'name, age\n Alice , 30 ';
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ name: 'Alice', age: '30' });
  });

  it('preserves whitespace in values when trim=false', () => {
    const csv = 'name, age\n Alice , 30 ';
    const rows = parseCsv(csv, { trim: false });
    // Headers are not trimmed either, so ' age' is the key
    expect(rows[0]).toEqual({ name: ' Alice ', ' age': ' 30 ' });
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,place\nAlice,"Tel Aviv, Israel"';
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ name: 'Alice', place: 'Tel Aviv, Israel' });
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const csv = 'name,note\nAlice,"She said ""hello"""';
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ name: 'Alice', note: 'She said "hello"' });
  });

  it('handles Windows-style CRLF line endings', () => {
    const csv = 'name,age\r\nAlice,30\r\nBob,25';
    expect(parseCsv(csv)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]);
  });

  it('fills missing columns with empty string', () => {
    const csv = 'name,age,city\nAlice,30';
    const rows = parseCsv(csv);
    expect(rows[0]).toEqual({ name: 'Alice', age: '30', city: '' });
  });

  it('uses a custom delimiter when specified', () => {
    const csv = 'name;age\nAlice;30';
    const rows = parseCsv(csv, { delimiter: ';' });
    expect(rows[0]).toEqual({ name: 'Alice', age: '30' });
  });
});

describe('parseCsv – no-header mode', () => {
  it('returns rows keyed by numeric index strings', () => {
    const csv = 'Alice,30\nBob,25';
    const rows = parseCsv(csv, { hasHeader: false });
    expect(rows).toEqual([
      { '0': 'Alice', '1': '30' },
      { '0': 'Bob', '1': '25' },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseCsv('', { hasHeader: false })).toEqual([]);
  });
});
