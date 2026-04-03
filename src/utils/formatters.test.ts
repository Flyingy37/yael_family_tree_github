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
  it('extracts year from "1 JAN 1920"', () => {
    expect(extractYear('1 JAN 1920')).toBe(1920);
  });

  it('extracts year from "ABT 1920"', () => {
    expect(extractYear('ABT 1920')).toBe(1920);
  });

  it('extracts year from "BEF 1945"', () => {
    expect(extractYear('BEF 1945')).toBe(1945);
  });

  it('extracts year from a plain four-digit year', () => {
    expect(extractYear('1985')).toBe(1985);
  });

  it('extracts year from "15 MAR 2001"', () => {
    expect(extractYear('15 MAR 2001')).toBe(2001);
  });

  it('returns null for null input', () => {
    expect(extractYear(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(extractYear(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractYear('')).toBeNull();
  });

  it('returns null when no four-digit year is present', () => {
    expect(extractYear('JAN')).toBeNull();
  });

  it('returns the first four-digit year when multiple are present', () => {
    expect(extractYear('BET 1920 AND 1930')).toBe(1920);
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
    expect(formatDate('CAL 1 JAN 1920')).toBe('1 JAN 1920');
  });

  it('strips EST prefix (case-insensitive)', () => {
    expect(formatDate('est 1950')).toBe('1950');
  });

  it('leaves a plain date untouched', () => {
    expect(formatDate('1 JAN 1920')).toBe('1 JAN 1920');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatLifespan', () => {
  it('returns "birth–death" when both dates are provided', () => {
    expect(formatLifespan('1920', '1985')).toBe('1920–1985');
  });

  it('returns "b. year" when only birth date is provided', () => {
    expect(formatLifespan('1 JAN 1920', null)).toBe('b. 1920');
  });

  it('returns "d. year" when only death date is provided', () => {
    expect(formatLifespan(null, 'ABT 1985')).toBe('d. 1985');
  });

  it('returns empty string when neither date is provided', () => {
    expect(formatLifespan(null, null)).toBe('');
  });

  it('returns empty string when both dates are undefined', () => {
    expect(formatLifespan(undefined, undefined)).toBe('');
  });

  it('handles GEDCOM prefixed dates', () => {
    expect(formatLifespan('ABT 1900', 'BEF 1960')).toBe('1900–1960');
  });
});

describe('titleCase', () => {
  it('capitalizes a simple name', () => {
    expect(titleCase('john')).toBe('John');
  });

  it('capitalizes multiple words', () => {
    expect(titleCase('john doe')).toBe('John Doe');
  });

  it('handles all-uppercase input', () => {
    expect(titleCase('JOHN DOE')).toBe('John Doe');
  });

  it('handles mixed case input', () => {
    expect(titleCase('jOhN dOe')).toBe('John Doe');
  });

  it('handles hyphenated names', () => {
    expect(titleCase('mary-jane')).toBe('Mary-Jane');
  });

  it('handles apostrophe names', () => {
    expect(titleCase("o'brien")).toBe("O'Brien");
  });

  it('handles a single character', () => {
    expect(titleCase('a')).toBe('A');
  });

  it('handles an empty string', () => {
    expect(titleCase('')).toBe('');
  });
});

describe('normalizeForSearch', () => {
  it('removes acute accent (é → e)', () => {
    expect(normalizeForSearch('café')).toBe('cafe');
  });

  it('removes umlaut (ö → o)', () => {
    expect(normalizeForSearch('Köln')).toBe('koln');
  });

  it('removes tilde (ñ → n)', () => {
    expect(normalizeForSearch('España')).toBe('espana');
  });

  it('lowercases the result', () => {
    expect(normalizeForSearch('HELLO')).toBe('hello');
  });

  it('handles a mix of diacritics', () => {
    expect(normalizeForSearch('Ménàgé à Tröis')).toBe('menage a trois');
  });

  it('leaves plain ASCII text unchanged', () => {
    expect(normalizeForSearch('hello world')).toBe('hello world');
  });

  it('handles an empty string', () => {
    expect(normalizeForSearch('')).toBe('');
  });

  it('handles Hebrew text (no diacritics to strip)', () => {
    const input = 'שלום';
    expect(normalizeForSearch(input)).toBe(input);
  });
});

describe('extractCountry', () => {
  it('extracts country from a multi-segment place', () => {
    expect(extractCountry('Tel Aviv, Israel')).toBe('Israel');
  });

  it('extracts country from a three-segment place', () => {
    expect(extractCountry('Brooklyn, New York, USA')).toBe('USA');
  });

  it('returns the single segment when no comma is present', () => {
    expect(extractCountry('Israel')).toBe('Israel');
  });

  it('trims trailing whitespace from the country', () => {
    expect(extractCountry('Berlin, Germany  ')).toBe('Germany');
  });

  it('trims leading whitespace from the country', () => {
    expect(extractCountry('Paris,  France')).toBe('France');
  });

  it('returns null for null input', () => {
    expect(extractCountry(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(extractCountry(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractCountry('')).toBeNull();
  });

  it('returns null when trailing segment is only whitespace', () => {
    expect(extractCountry('Paris, ')).toBeNull();
  });
});
