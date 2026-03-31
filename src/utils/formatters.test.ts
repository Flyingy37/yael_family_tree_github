import { describe, it, expect } from 'vitest';
import {
  extractYear,
  formatDate,
  formatLifespan,
  titleCase,
  normalizeForSearch,
  extractCountry,
} from './formatters';

describe('extractYear', () => {
  it('extracts year from a full GEDCOM date', () => {
    expect(extractYear('1 JAN 1920')).toBe(1920);
  });

  it('extracts year from ABT prefix', () => {
    expect(extractYear('ABT 1945')).toBe(1945);
  });

  it('extracts year from BEF prefix', () => {
    expect(extractYear('BEF 1945')).toBe(1945);
  });

  it('extracts year from AFT prefix', () => {
    expect(extractYear('AFT 1900')).toBe(1900);
  });

  it('extracts year from bare year string', () => {
    expect(extractYear('1985')).toBe(1985);
  });

  it('extracts year from complex date string', () => {
    expect(extractYear('15 MAR 2001')).toBe(2001);
  });

  it('returns null for null input', () => {
    expect(extractYear(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(extractYear(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractYear('')).toBeNull();
  });

  it('returns null for string with no 4-digit year', () => {
    expect(extractYear('unknown')).toBeNull();
  });

  it('returns null for 3-digit number', () => {
    expect(extractYear('123')).toBeNull();
  });
});

describe('formatDate', () => {
  it('strips ABT prefix', () => {
    expect(formatDate('ABT 1920')).toBe('1920');
  });

  it('strips BEF prefix', () => {
    expect(formatDate('BEF 1945')).toBe('1945');
  });

  it('strips AFT prefix', () => {
    expect(formatDate('AFT 1900')).toBe('1900');
  });

  it('strips CAL prefix', () => {
    expect(formatDate('CAL 1930')).toBe('1930');
  });

  it('strips EST prefix', () => {
    expect(formatDate('EST 1955')).toBe('1955');
  });

  it('strips prefix case-insensitively', () => {
    expect(formatDate('abt 1920')).toBe('1920');
  });

  it('returns a full date string unchanged', () => {
    expect(formatDate('1 JAN 1920')).toBe('1 JAN 1920');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatLifespan', () => {
  it('returns birth–death range when both are known', () => {
    expect(formatLifespan('1 JAN 1920', '15 DEC 1985')).toBe('1920–1985');
  });

  it('returns "b. YEAR" when only birth year is known', () => {
    expect(formatLifespan('1920', null)).toBe('b. 1920');
  });

  it('returns "d. YEAR" when only death year is known', () => {
    expect(formatLifespan(null, '1985')).toBe('d. 1985');
  });

  it('returns empty string when both are null', () => {
    expect(formatLifespan(null, null)).toBe('');
  });

  it('returns empty string when both are undefined', () => {
    expect(formatLifespan(undefined, undefined)).toBe('');
  });

  it('returns empty string when neither year can be parsed', () => {
    expect(formatLifespan('unknown', 'unknown')).toBe('');
  });

  it('handles ABT-prefixed birth year', () => {
    expect(formatLifespan('ABT 1900', '1950')).toBe('1900–1950');
  });
});

describe('titleCase', () => {
  it('capitalizes simple names', () => {
    expect(titleCase('john smith')).toBe('John Smith');
  });

  it('handles already-uppercase input', () => {
    expect(titleCase('JOHN SMITH')).toBe('John Smith');
  });

  it('handles hyphenated names', () => {
    expect(titleCase('mary-jane watson')).toBe('Mary-Jane Watson');
  });

  it("handles apostrophe names like O'Brien", () => {
    expect(titleCase("o'brien")).toBe("O'Brien");
  });

  it('handles single word', () => {
    expect(titleCase('alice')).toBe('Alice');
  });

  it('handles mixed case input', () => {
    expect(titleCase('joHN doE')).toBe('John Doe');
  });

  it('handles empty string', () => {
    expect(titleCase('')).toBe('');
  });
});

describe('normalizeForSearch', () => {
  it('lowercases ASCII text', () => {
    expect(normalizeForSearch('Hello World')).toBe('hello world');
  });

  it('strips accents from letters', () => {
    expect(normalizeForSearch('Müller')).toBe('muller');
  });

  it('strips accents from multiple characters', () => {
    expect(normalizeForSearch('café naïve')).toBe('cafe naive');
  });

  it('preserves Hebrew characters unchanged', () => {
    const hebrew = 'שלום';
    expect(normalizeForSearch(hebrew)).toBe(hebrew);
  });

  it('handles empty string', () => {
    expect(normalizeForSearch('')).toBe('');
  });

  it('returns lowercase for plain ASCII', () => {
    expect(normalizeForSearch('ABC')).toBe('abc');
  });
});

describe('extractCountry', () => {
  it('extracts last segment as country', () => {
    expect(extractCountry('Minsk, Belarus')).toBe('Belarus');
  });

  it('extracts from multi-segment place', () => {
    expect(extractCountry('Tel Aviv, Israel')).toBe('Israel');
  });

  it('extracts from three-segment place', () => {
    expect(extractCountry('City, Region, Country')).toBe('Country');
  });

  it('returns the only segment when no comma', () => {
    expect(extractCountry('Israel')).toBe('Israel');
  });

  it('trims whitespace from result', () => {
    expect(extractCountry('Minsk,  Belarus  ')).toBe('Belarus');
  });

  it('returns null for null input', () => {
    expect(extractCountry(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(extractCountry(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractCountry('')).toBeNull();
  });

  it('returns null when last segment is empty (trailing comma)', () => {
    expect(extractCountry('Israel,')).toBeNull();
  });
});
