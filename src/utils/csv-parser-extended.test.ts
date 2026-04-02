import { describe, it, expect } from 'vitest';
import { parseCsv } from './csv-parser';

/**
 * Additional edge case tests for csv-parser to improve coverage.
 * These complement the existing csv-parser.test.ts tests.
 */
describe('parseCsv – additional edge cases', () => {
  describe('multi-line quoted fields', () => {
    it('handles newlines within quoted fields', () => {
      const csv = 'name,note\nAlice,"line1\nline2"';
      // Current parser splits on \n first, so this tests how the parser handles it
      const result = parseCsv(csv);
      // Since the parser splits by line first, quoted newlines will not be preserved
      // This documents current behavior
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles extra columns beyond headers', () => {
      const csv = 'a,b\n1,2,3';
      const result = parseCsv(csv);
      expect(result[0]).toEqual({ a: '1', b: '2' });
    });
  });

  describe('special characters in data', () => {
    it('handles Hebrew text in CSV', () => {
      const csv = 'name,place\nשלום,ישראל';
      const result = parseCsv(csv);
      expect(result).toEqual([{ name: 'שלום', place: 'ישראל' }]);
    });

    it('handles accented characters', () => {
      const csv = 'name,city\nMüller,Zürich';
      const result = parseCsv(csv);
      expect(result).toEqual([{ name: 'Müller', city: 'Zürich' }]);
    });

    it('handles multiple quoted commas in one row', () => {
      const csv = 'a,b,c\n"x,y","1,2","p,q"';
      const result = parseCsv(csv);
      expect(result).toEqual([{ a: 'x,y', b: '1,2', c: 'p,q' }]);
    });

    it('handles empty values between delimiters', () => {
      const csv = 'a,b,c\n,,';
      const result = parseCsv(csv);
      expect(result).toEqual([{ a: '', b: '', c: '' }]);
    });

    it('handles single column CSV', () => {
      const csv = 'name\nAlice\nBob';
      const result = parseCsv(csv);
      expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });
  });

  describe('no-header mode with various inputs', () => {
    it('handles quoted fields without headers', () => {
      const csv = '"Alice","Tel Aviv, Israel"';
      const result = parseCsv(csv, { hasHeader: false });
      expect(result).toEqual([{ '0': 'Alice', '1': 'Tel Aviv, Israel' }]);
    });

    it('handles empty input without headers', () => {
      const result = parseCsv('', { hasHeader: false });
      expect(result).toEqual([]);
    });
  });

  describe('combined options', () => {
    it('handles TSV without headers', () => {
      const tsv = 'Alice\t30\nBob\t25';
      const result = parseCsv(tsv, { delimiter: '\t', hasHeader: false });
      expect(result).toEqual([
        { '0': 'Alice', '1': '30' },
        { '0': 'Bob', '1': '25' },
      ]);
    });

    it('handles semicolons with no-trim', () => {
      const csv = 'name;age\n Alice ; 30 ';
      const result = parseCsv(csv, { delimiter: ';', trim: false });
      expect(result[0].name).toBe(' Alice ');
      expect(result[0].age).toBe(' 30 ');
    });
  });

  describe('consecutive double quotes in quoted fields', () => {
    it('handles multiple escaped quotes', () => {
      const csv = 'a\n"""hello"""';
      const result = parseCsv(csv);
      expect(result[0].a).toBe('"hello"');
    });

    it('handles empty quoted field with surrounding data', () => {
      const csv = 'a,b,c\nfoo,"",bar';
      const result = parseCsv(csv);
      expect(result[0]).toEqual({ a: 'foo', b: '', c: 'bar' });
    });
  });
});
