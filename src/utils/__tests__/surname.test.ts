import { describe, it, expect } from 'vitest';
import { getCanonicalSurnameLabel } from '../surname';

describe('getCanonicalSurnameLabel', () => {
  // --- Alperovich cluster ---
  describe('Alperovich cluster', () => {
    it('returns Alperovich for "Alperovich"', () => {
      expect(getCanonicalSurnameLabel('Alperovich')).toBe('Alperovich');
    });

    it('returns Alperovich for "Alperovitch"', () => {
      expect(getCanonicalSurnameLabel('Alperovitch')).toBe('Alperovich');
    });

    it('returns Alperovich for "Alperovitz"', () => {
      expect(getCanonicalSurnameLabel('Alperovitz')).toBe('Alperovich');
    });

    it('returns Alperovich for "Halperovich"', () => {
      expect(getCanonicalSurnameLabel('Halperovich')).toBe('Alperovich');
    });

    it('returns Alperovich for "Galperovich"', () => {
      expect(getCanonicalSurnameLabel('Galperovich')).toBe('Alperovich');
    });

    it('returns Alperovich for Hebrew variant "אלפרוביץ"', () => {
      expect(getCanonicalSurnameLabel('אלפרוביץ')).toBe('Alperovich');
    });

    it('returns Alperovich for Cyrillic variant "Алперович"', () => {
      expect(getCanonicalSurnameLabel('Алперович')).toBe('Alperovich');
    });

    it('returns Alperovich for mixed "Alpert (Alperovich)"', () => {
      expect(getCanonicalSurnameLabel('Alpert (Alperovich)')).toBe('Alperovich');
    });
  });

  // --- Kastrel cluster ---
  describe('Kastrel cluster', () => {
    it('returns Kastrel for "Kastrel"', () => {
      expect(getCanonicalSurnameLabel('Kastrel')).toBe('Kastrel');
    });

    it('returns Kastrel for "Castroll"', () => {
      expect(getCanonicalSurnameLabel('Castroll')).toBe('Kastrel');
    });

    it('returns Kastrel for "Castro"', () => {
      expect(getCanonicalSurnameLabel('Castro')).toBe('Kastrel');
    });

    it('returns Kastrel for "Kostrell"', () => {
      expect(getCanonicalSurnameLabel('Kostrell')).toBe('Kastrel');
    });

    it('returns Kastrel for "kastrel/castrel"', () => {
      expect(getCanonicalSurnameLabel('kastrel/castrel')).toBe('Kastrel');
    });
  });

  // --- Duberstein cluster ---
  describe('Duberstein cluster', () => {
    it('returns Duberstein for "Duberstein"', () => {
      expect(getCanonicalSurnameLabel('Duberstein')).toBe('Duberstein');
    });

    it('returns Duberstein for "Dubershtein"', () => {
      expect(getCanonicalSurnameLabel('Dubershtein')).toBe('Duberstein');
    });

    it('returns Duberstein for "Doberstein"', () => {
      expect(getCanonicalSurnameLabel('Doberstein')).toBe('Duberstein');
    });
  });

  // --- Zaidman cluster ---
  describe('Zaidman cluster', () => {
    it('returns Zaidman for "Zaidman"', () => {
      expect(getCanonicalSurnameLabel('Zaidman')).toBe('Zaidman');
    });

    it('returns Zaidman for "Zeidman"', () => {
      expect(getCanonicalSurnameLabel('Zeidman')).toBe('Zaidman');
    });

    it('returns Zaidman for "Seidman"', () => {
      expect(getCanonicalSurnameLabel('Seidman')).toBe('Zaidman');
    });

    it('returns Zaidman for "Seidmann"', () => {
      expect(getCanonicalSurnameLabel('Seidmann')).toBe('Zaidman');
    });
  });

  // --- Vulis cluster ---
  describe('Vulis cluster', () => {
    it('returns Vulis for "Vulis"', () => {
      expect(getCanonicalSurnameLabel('Vulis')).toBe('Vulis');
    });

    it('returns Vulis for "Wulis"', () => {
      expect(getCanonicalSurnameLabel('Wulis')).toBe('Vulis');
    });
  });

  // --- Passthrough cases ---
  describe('passthrough (no cluster match)', () => {
    it('returns empty string for empty input', () => {
      expect(getCanonicalSurnameLabel('')).toBe('');
    });

    it('returns trimmed value for an unrecognised surname', () => {
      expect(getCanonicalSurnameLabel('  Cohen  ')).toBe('Cohen');
    });

    it('returns the original value for "Levy"', () => {
      expect(getCanonicalSurnameLabel('Levy')).toBe('Levy');
    });

    it('does not confuse "Alpert" alone with Alperovich cluster', () => {
      // "Alpert" without "alperov" should not be remapped
      expect(getCanonicalSurnameLabel('Alpert')).toBe('Alpert');
    });
  });
});
