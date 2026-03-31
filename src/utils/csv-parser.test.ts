import { describe, it, expect } from 'vitest';
import { parseCsv } from './csv-parser';

describe('parseCsv', () => {
  describe('basic parsing with header', () => {
    it('parses a simple two-column CSV', () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      expect(parseCsv(csv)).toEqual([
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' },
      ]);
    });

    it('returns empty array for empty string', () => {
      expect(parseCsv('')).toEqual([]);
    });

    it('returns empty array for whitespace-only string', () => {
      expect(parseCsv('   ')).toEqual([]);
    });

    it('returns empty array for header-only CSV', () => {
      expect(parseCsv('name,age')).toEqual([]);
    });

    it('fills missing columns with empty string', () => {
      const csv = 'a,b,c\n1,2';
      const result = parseCsv(csv);
      expect(result[0]).toEqual({ a: '1', b: '2', c: '' });
    });
  });

  describe('quoted fields', () => {
    it('handles a field wrapped in double quotes', () => {
      const csv = 'name,note\nAlice,"hello world"';
      expect(parseCsv(csv)).toEqual([{ name: 'Alice', note: 'hello world' }]);
    });

    it('handles a quoted field containing a comma', () => {
      const csv = 'name,place\nAlice,"Tel Aviv, Israel"';
      expect(parseCsv(csv)).toEqual([{ name: 'Alice', place: 'Tel Aviv, Israel' }]);
    });

    it('handles escaped double quotes inside quoted field', () => {
      const csv = 'name,note\nAlice,"say ""hello"""';
      expect(parseCsv(csv)).toEqual([{ name: 'Alice', note: 'say "hello"' }]);
    });

    it('handles empty quoted field', () => {
      const csv = 'a,b\n"",value';
      expect(parseCsv(csv)).toEqual([{ a: '', b: 'value' }]);
    });
  });

  describe('trimming', () => {
    it('trims whitespace from values by default', () => {
      const csv = 'name , age\n Alice , 30 ';
      expect(parseCsv(csv)).toEqual([{ name: 'Alice', age: '30' }]);
    });

    it('preserves whitespace when trim is false', () => {
      const csv = 'name,age\n Alice , 30 ';
      const result = parseCsv(csv, { trim: false });
      expect(result[0].name).toBe(' Alice ');
      expect(result[0].age).toBe(' 30 ');
    });
  });

  describe('custom delimiter', () => {
    it('parses TSV with tab delimiter', () => {
      const tsv = 'name\tage\nAlice\t30';
      expect(parseCsv(tsv, { delimiter: '\t' })).toEqual([{ name: 'Alice', age: '30' }]);
    });

    it('parses semicolon-delimited CSV', () => {
      const csv = 'name;age\nAlice;30';
      expect(parseCsv(csv, { delimiter: ';' })).toEqual([{ name: 'Alice', age: '30' }]);
    });
  });

  describe('no-header mode', () => {
    it('returns numeric-keyed rows when hasHeader is false', () => {
      const csv = 'Alice,30\nBob,25';
      const result = parseCsv(csv, { hasHeader: false });
      expect(result).toEqual([
        { '0': 'Alice', '1': '30' },
        { '0': 'Bob', '1': '25' },
      ]);
    });

    it('returns single row when hasHeader is false and one data row', () => {
      const csv = 'Alice,30';
      const result = parseCsv(csv, { hasHeader: false });
      expect(result).toEqual([{ '0': 'Alice', '1': '30' }]);
    });
  });

  describe('Windows line endings', () => {
    it('handles CRLF line endings', () => {
      const csv = 'name,age\r\nAlice,30\r\nBob,25';
      expect(parseCsv(csv)).toEqual([
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' },
      ]);
    });
  });
});
