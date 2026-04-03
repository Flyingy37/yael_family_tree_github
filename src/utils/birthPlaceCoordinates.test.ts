import { describe, it, expect } from 'vitest';
import { approximateCoordinatesForBirthPlace } from './birthPlaceCoordinates';

describe('approximateCoordinatesForBirthPlace', () => {
  it('returns null for null input', () => {
    expect(approximateCoordinatesForBirthPlace(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(approximateCoordinatesForBirthPlace(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(approximateCoordinatesForBirthPlace('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(approximateCoordinatesForBirthPlace('   ')).toBeNull();
  });

  it('returns coordinates for "Minsk"', () => {
    const result = approximateCoordinatesForBirthPlace('Minsk');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Minsk, Belarus');
    expect(result!.lat).toBeCloseTo(53.9, 0);
  });

  it('returns coordinates for "Tel Aviv"', () => {
    const result = approximateCoordinatesForBirthPlace('Tel Aviv');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Tel Aviv, Israel');
  });

  it('returns coordinates for "Jerusalem"', () => {
    const result = approximateCoordinatesForBirthPlace('Jerusalem');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Jerusalem, Israel');
  });

  it('returns coordinates for "New York"', () => {
    const result = approximateCoordinatesForBirthPlace('New York');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('New York area, USA');
  });

  it('returns coordinates for "Vilnius"', () => {
    const result = approximateCoordinatesForBirthPlace('Vilnius');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Vilnius, Lithuania');
  });

  it('returns coordinates for "Kurenets"', () => {
    const result = approximateCoordinatesForBirthPlace('Kurenets');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Kurenets, Belarus');
  });

  it('is case insensitive: "MINSK", "minsk", "MiNsK"', () => {
    for (const variant of ['MINSK', 'minsk', 'MiNsK']) {
      const result = approximateCoordinatesForBirthPlace(variant);
      expect(result).not.toBeNull();
      expect(result!.label).toBe('Minsk, Belarus');
    }
  });

  it('matches Hebrew text "מינסק"', () => {
    const result = approximateCoordinatesForBirthPlace('מינסק');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Minsk, Belarus');
  });

  it('matches Hebrew text "תל אביב"', () => {
    const result = approximateCoordinatesForBirthPlace('תל אביב');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Tel Aviv, Israel');
  });

  it('matches Hebrew text "ירושלים"', () => {
    const result = approximateCoordinatesForBirthPlace('ירושלים');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Jerusalem, Israel');
  });

  it('matches substring: "Born in Minsk, Belarus"', () => {
    const result = approximateCoordinatesForBirthPlace('Born in Minsk, Belarus');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Minsk, Belarus');
  });

  it('returns null for unknown place "Atlantis"', () => {
    expect(approximateCoordinatesForBirthPlace('Atlantis')).toBeNull();
  });

  it('matches "Brooklyn" and "Manhattan" to New York', () => {
    for (const place of ['Brooklyn', 'Manhattan']) {
      const result = approximateCoordinatesForBirthPlace(place);
      expect(result).not.toBeNull();
      expect(result!.label).toBe('New York area, USA');
    }
  });

  it('matches variant spellings "Vilna" and "Wilno" to Vilnius', () => {
    for (const variant of ['Vilna', 'Wilno']) {
      const result = approximateCoordinatesForBirthPlace(variant);
      expect(result).not.toBeNull();
      expect(result!.label).toBe('Vilnius, Lithuania');
    }
  });
});
