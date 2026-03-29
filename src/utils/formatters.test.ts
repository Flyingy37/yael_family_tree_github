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
  it('extracts year from full GEDCOM date', () => {
    expect(extractYear('1 JAN 1920')).toBe(1920);
  });

  it('extracts year from abbreviated prefix ABT', () => {
    expect(extractYear('ABT 1920')).toBe(1920);
  });

  it('extracts year from BEF prefix', () => {
    expect(extractYear('BEF 1945')).toBe(1945);
  });

  it('extracts year from a bare four-digit year', () => {
    expect(extractYear('1920')).toBe(1920);
  });

  it('returns null for an empty string', () => {
    expect(extractYear('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(extractYear(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(extractYear(undefined)).toBeNull();
  });

  it('returns null when string has no four-digit year', () => {
    expect(extractYear('JAN')).toBeNull();
  });

  it('extracts year when embedded in longer date text', () => {
    expect(extractYear('EST 15 MAR 1899')).toBe(1899);
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
    expect(formatDate('AFT 1910')).toBe('1910');
  });

  it('strips CAL prefix', () => {
    expect(formatDate('CAL 1930')).toBe('1930');
  });

  it('strips EST prefix', () => {
    expect(formatDate('EST 1800')).toBe('1800');
  });

  it('is case-insensitive for prefix stripping', () => {
    expect(formatDate('abt 1920')).toBe('1920');
  });

  it('leaves plain dates unchanged', () => {
    expect(formatDate('1 JAN 1920')).toBe('1 JAN 1920');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatLifespan', () => {
  it('formats a full birth–death range', () => {
    expect(formatLifespan('1 JAN 1920', '5 MAR 1985')).toBe('1920–1985');
  });

  it('formats birth-only lifespan', () => {
    expect(formatLifespan('1920', null)).toBe('b. 1920');
  });

  it('formats death-only lifespan', () => {
    expect(formatLifespan(null, '1985')).toBe('d. 1985');
  });

  it('returns empty string when both dates are null', () => {
    expect(formatLifespan(null, null)).toBe('');
  });

  it('returns empty string when both dates are undefined', () => {
    expect(formatLifespan(undefined, undefined)).toBe('');
  });

  it('handles ABT prefix in birth date', () => {
    expect(formatLifespan('ABT 1920', '1985')).toBe('1920–1985');
  });
});

describe('titleCase', () => {
  it('capitalises a single word', () => {
    expect(titleCase('hello')).toBe('Hello');
  });

  it('capitalises multiple words', () => {
    expect(titleCase('john doe')).toBe('John Doe');
  });

  it('capitalises after a hyphen', () => {
    expect(titleCase('mary-jane watson')).toBe('Mary-Jane Watson');
  });

  it('capitalises after an apostrophe', () => {
    expect(titleCase("o'brien")).toBe("O'Brien");
  });

  it('lowercases uppercase input before capitalising', () => {
    expect(titleCase('JOHN DOE')).toBe('John Doe');
  });

  it('handles an empty string', () => {
    expect(titleCase('')).toBe('');
  });
});

describe('normalizeForSearch', () => {
  it('lowercases the input', () => {
    expect(normalizeForSearch('Hello')).toBe('hello');
  });

  it('removes diacritics', () => {
    expect(normalizeForSearch('café')).toBe('cafe');
  });

  it('handles multiple diacritics in a word', () => {
    expect(normalizeForSearch('naïve')).toBe('naive');
  });

  it('handles a string with no special characters', () => {
    expect(normalizeForSearch('simple')).toBe('simple');
  });

  it('handles an empty string', () => {
    expect(normalizeForSearch('')).toBe('');
  });
});

describe('extractCountry', () => {
  it('extracts the last segment of a comma-separated place', () => {
    expect(extractCountry('Tel Aviv, Israel')).toBe('Israel');
  });

  it('extracts country from a three-part place', () => {
    expect(extractCountry('City, Region, Country')).toBe('Country');
  });

  it('returns the entire string when no comma is present', () => {
    expect(extractCountry('Israel')).toBe('Israel');
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

  it('trims whitespace from the extracted country', () => {
    expect(extractCountry('City,  Poland ')).toBe('Poland');
  });
});
