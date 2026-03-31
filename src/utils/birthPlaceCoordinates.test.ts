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

  it('returns null for unknown place', () => {
    expect(approximateCoordinatesForBirthPlace('Unknown City, Unknown Country')).toBeNull();
  });

  it('matches Tel Aviv (English)', () => {
    const result = approximateCoordinatesForBirthPlace('Tel Aviv, Israel');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Tel Aviv, Israel');
    expect(result!.lat).toBeCloseTo(32.09, 1);
    expect(result!.lng).toBeCloseTo(34.78, 1);
  });

  it('matches Jerusalem (Hebrew)', () => {
    const result = approximateCoordinatesForBirthPlace('ירושלים');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Jerusalem, Israel');
  });

  it('matches Minsk (English)', () => {
    const result = approximateCoordinatesForBirthPlace('Minsk, Belarus');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Minsk, Belarus');
  });

  it('matches Minsk (Hebrew)', () => {
    const result = approximateCoordinatesForBirthPlace('מינסק');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Minsk, Belarus');
  });

  it('matches Vilnius (alias Vilna)', () => {
    const result = approximateCoordinatesForBirthPlace('Vilna, Lithuania');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Vilnius, Lithuania');
  });

  it('matches New York', () => {
    const result = approximateCoordinatesForBirthPlace('Brooklyn, New York, USA');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('New York area, USA');
  });

  it('matches Warsaw (Polish spelling)', () => {
    const result = approximateCoordinatesForBirthPlace('Warszawa, Poland');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Warsaw, Poland');
  });

  it('matching is case-insensitive', () => {
    const result = approximateCoordinatesForBirthPlace('TEL AVIV');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Tel Aviv, Israel');
  });

  it('matches Haifa', () => {
    const result = approximateCoordinatesForBirthPlace('Haifa, Israel');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Haifa, Israel');
  });

  it('matches Kurenets (variant spelling)', () => {
    const result = approximateCoordinatesForBirthPlace('Kurenets, Belarus');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Kurenets, Belarus');
  });

  it('matches Riga', () => {
    const result = approximateCoordinatesForBirthPlace('Riga, Latvia');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Riga, Latvia');
  });

  it('matches Vienna (German spelling)', () => {
    const result = approximateCoordinatesForBirthPlace('Wien, Austria');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Vienna, Austria');
  });

  it('matches Chicago', () => {
    const result = approximateCoordinatesForBirthPlace('Chicago, IL, USA');
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Chicago, USA');
  });
});
