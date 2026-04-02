import { describe, it, expect } from 'vitest';
import { parseGedcomLines, extractIndiIds, type GedcomLine } from './gedcomService';

describe('parseGedcomLines', () => {
  it('parses a simple INDI record header', () => {
    const lines = parseGedcomLines('0 @I1@ INDI');
    expect(lines).toEqual([
      { level: 0, xref: '@I1@', tag: 'INDI', value: '' },
    ]);
  });

  it('parses a level-1 NAME tag with value', () => {
    const lines = parseGedcomLines('1 NAME John /Smith/');
    expect(lines).toEqual([
      { level: 1, xref: null, tag: 'NAME', value: 'John /Smith/' },
    ]);
  });

  it('parses a level-2 DATE tag', () => {
    const lines = parseGedcomLines('2 DATE 1 JAN 1920');
    expect(lines).toEqual([
      { level: 2, xref: null, tag: 'DATE', value: '1 JAN 1920' },
    ]);
  });

  it('parses a FAM record header', () => {
    const lines = parseGedcomLines('0 @F1@ FAM');
    expect(lines).toEqual([
      { level: 0, xref: '@F1@', tag: 'FAM', value: '' },
    ]);
  });

  it('parses multiple lines', () => {
    const raw = [
      '0 @I1@ INDI',
      '1 NAME John /Smith/',
      '1 SEX M',
      '2 DATE 1 JAN 1920',
    ].join('\n');
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(4);
    expect(lines[0]).toEqual({ level: 0, xref: '@I1@', tag: 'INDI', value: '' });
    expect(lines[1]).toEqual({ level: 1, xref: null, tag: 'NAME', value: 'John /Smith/' });
    expect(lines[2]).toEqual({ level: 1, xref: null, tag: 'SEX', value: 'M' });
    expect(lines[3]).toEqual({ level: 2, xref: null, tag: 'DATE', value: '1 JAN 1920' });
  });

  it('handles \\r\\n line endings', () => {
    const raw = '0 @I1@ INDI\r\n1 NAME Alice\r\n';
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(2);
    expect(lines[0].xref).toBe('@I1@');
    expect(lines[1].tag).toBe('NAME');
  });

  it('skips empty lines', () => {
    const raw = '0 @I1@ INDI\n\n\n1 NAME Alice\n';
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(2);
  });

  it('skips whitespace-only lines', () => {
    const raw = '0 @I1@ INDI\n   \n1 SEX F';
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(parseGedcomLines('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(parseGedcomLines('   \n  \n  ')).toEqual([]);
  });

  it('skips malformed lines that do not match GEDCOM pattern', () => {
    const raw = [
      '0 @I1@ INDI',
      'this is not a valid line',
      '1 NAME Alice',
    ].join('\n');
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(2);
    expect(lines[0].tag).toBe('INDI');
    expect(lines[1].tag).toBe('NAME');
  });

  it('trims trailing whitespace from values', () => {
    const lines = parseGedcomLines('1 NAME John Smith   ');
    expect(lines[0].value).toBe('John Smith');
  });

  it('handles tag with no value', () => {
    const lines = parseGedcomLines('1 BIRT');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toEqual({ level: 1, xref: null, tag: 'BIRT', value: '' });
  });

  it('handles tags with underscores', () => {
    const lines = parseGedcomLines('1 _CUSTOM some value');
    expect(lines[0].tag).toBe('_CUSTOM');
    expect(lines[0].value).toBe('some value');
  });

  it('parses GEDCOM trailer', () => {
    const lines = parseGedcomLines('0 TRLR');
    expect(lines).toEqual([
      { level: 0, xref: null, tag: 'TRLR', value: '' },
    ]);
  });

  it('handles HEAD record', () => {
    const raw = '0 HEAD\n1 SOUR MyApp\n1 GEDC\n2 VERS 5.5';
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(4);
    expect(lines[0]).toEqual({ level: 0, xref: null, tag: 'HEAD', value: '' });
    expect(lines[1]).toEqual({ level: 1, xref: null, tag: 'SOUR', value: 'MyApp' });
    expect(lines[3]).toEqual({ level: 2, xref: null, tag: 'VERS', value: '5.5' });
  });

  it('parses a realistic multi-record GEDCOM block', () => {
    const raw = [
      '0 HEAD',
      '1 GEDC',
      '2 VERS 5.5',
      '0 @I1@ INDI',
      '1 NAME John /Smith/',
      '1 SEX M',
      '1 BIRT',
      '2 DATE 1 JAN 1920',
      '2 PLAC Tel Aviv, Israel',
      '1 FAMS @F1@',
      '0 @I2@ INDI',
      '1 NAME Jane /Doe/',
      '1 SEX F',
      '0 @F1@ FAM',
      '1 HUSB @I1@',
      '1 WIFE @I2@',
      '0 TRLR',
    ].join('\n');
    const lines = parseGedcomLines(raw);
    expect(lines).toHaveLength(17);

    // Check some key records
    const indiRecords = lines.filter(l => l.level === 0 && l.tag === 'INDI');
    expect(indiRecords).toHaveLength(2);
    expect(indiRecords[0].xref).toBe('@I1@');
    expect(indiRecords[1].xref).toBe('@I2@');

    const famRecords = lines.filter(l => l.level === 0 && l.tag === 'FAM');
    expect(famRecords).toHaveLength(1);
    expect(famRecords[0].xref).toBe('@F1@');
  });
});

describe('extractIndiIds', () => {
  it('extracts INDI xref IDs from level-0 lines', () => {
    const lines: GedcomLine[] = [
      { level: 0, xref: '@I1@', tag: 'INDI', value: '' },
      { level: 1, xref: null, tag: 'NAME', value: 'John' },
      { level: 0, xref: '@I2@', tag: 'INDI', value: '' },
      { level: 0, xref: '@F1@', tag: 'FAM', value: '' },
    ];
    expect(extractIndiIds(lines)).toEqual(['@I1@', '@I2@']);
  });

  it('excludes FAM records', () => {
    const lines: GedcomLine[] = [
      { level: 0, xref: '@F1@', tag: 'FAM', value: '' },
      { level: 0, xref: '@F2@', tag: 'FAM', value: '' },
    ];
    expect(extractIndiIds(lines)).toEqual([]);
  });

  it('excludes non-level-0 INDI lines', () => {
    const lines: GedcomLine[] = [
      { level: 1, xref: '@I1@', tag: 'INDI', value: '' },
    ];
    expect(extractIndiIds(lines)).toEqual([]);
  });

  it('excludes level-0 lines without xref', () => {
    const lines: GedcomLine[] = [
      { level: 0, xref: null, tag: 'INDI', value: '' },
    ];
    expect(extractIndiIds(lines)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(extractIndiIds([])).toEqual([]);
  });

  it('returns empty array for header-only lines', () => {
    const lines: GedcomLine[] = [
      { level: 0, xref: null, tag: 'HEAD', value: '' },
      { level: 1, xref: null, tag: 'GEDC', value: '' },
      { level: 0, xref: null, tag: 'TRLR', value: '' },
    ];
    expect(extractIndiIds(lines)).toEqual([]);
  });

  it('works end-to-end with parseGedcomLines', () => {
    const raw = [
      '0 HEAD',
      '0 @I1@ INDI',
      '1 NAME Alice',
      '0 @I2@ INDI',
      '1 NAME Bob',
      '0 @F1@ FAM',
      '0 TRLR',
    ].join('\n');
    const lines = parseGedcomLines(raw);
    const ids = extractIndiIds(lines);
    expect(ids).toEqual(['@I1@', '@I2@']);
  });
});
