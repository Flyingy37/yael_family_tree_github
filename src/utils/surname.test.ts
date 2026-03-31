import { describe, it, expect } from 'vitest';
import { getCanonicalSurnameLabel } from './surname';

describe('getCanonicalSurnameLabel', () => {
  describe('Alperovich cluster', () => {
    it('maps "Alperovich" to canonical label', () => {
      expect(getCanonicalSurnameLabel('Alperovich')).toBe('Alperovich');
    });

    it('maps "Alperovitch" variant', () => {
      expect(getCanonicalSurnameLabel('Alperovitch')).toBe('Alperovich');
    });

    it('maps "Alperovitz" variant', () => {
      expect(getCanonicalSurnameLabel('Alperovitz')).toBe('Alperovich');
    });

    it('maps "Halperovich" variant', () => {
      expect(getCanonicalSurnameLabel('Halperovich')).toBe('Alperovich');
    });

    it('maps "Galperovich" variant', () => {
      expect(getCanonicalSurnameLabel('Galperovich')).toBe('Alperovich');
    });

    it('maps Hebrew Alperovich variant', () => {
      expect(getCanonicalSurnameLabel('אלפרוביץ')).toBe('Alperovich');
    });

    it('maps mixed "Alpert (Alperovich)" to Alperovich cluster', () => {
      expect(getCanonicalSurnameLabel('Alpert (Alperovich)')).toBe('Alperovich');
    });
  });

  describe('Kastrel cluster', () => {
    it('maps "Kastrel" to canonical label', () => {
      expect(getCanonicalSurnameLabel('Kastrel')).toBe('Kastrel');
    });

    it('maps "Castrel" variant', () => {
      expect(getCanonicalSurnameLabel('Castrel')).toBe('Kastrel');
    });

    it('maps "Castro" variant', () => {
      expect(getCanonicalSurnameLabel('Castro')).toBe('Kastrel');
    });

    it('maps "Kastrel/Castrel" combined form', () => {
      expect(getCanonicalSurnameLabel('kastrel/castrel')).toBe('Kastrel');
    });
  });

  describe('Duberstein cluster', () => {
    it('maps "Duberstein" to canonical label', () => {
      expect(getCanonicalSurnameLabel('Duberstein')).toBe('Duberstein');
    });

    it('maps "Dubershtein" variant', () => {
      expect(getCanonicalSurnameLabel('Dubershtein')).toBe('Duberstein');
    });

    it('maps "Doberstein" variant', () => {
      expect(getCanonicalSurnameLabel('Doberstein')).toBe('Duberstein');
    });
  });

  describe('Zaidman cluster', () => {
    it('maps "Zaidman" to canonical label', () => {
      expect(getCanonicalSurnameLabel('Zaidman')).toBe('Zaidman');
    });

    it('maps "Zeidman" variant', () => {
      expect(getCanonicalSurnameLabel('Zeidman')).toBe('Zaidman');
    });

    it('maps "Seidman" variant', () => {
      expect(getCanonicalSurnameLabel('Seidman')).toBe('Zaidman');
    });

    it('maps "Seidmann" double-n variant', () => {
      expect(getCanonicalSurnameLabel('Seidmann')).toBe('Zaidman');
    });
  });

  describe('Vulis cluster', () => {
    it('maps "Vulis" to canonical label', () => {
      expect(getCanonicalSurnameLabel('Vulis')).toBe('Vulis');
    });

    it('maps "Wulis" variant', () => {
      expect(getCanonicalSurnameLabel('Wulis')).toBe('Vulis');
    });
  });

  describe('unrecognised surnames', () => {
    it('returns the trimmed input for unknown surnames', () => {
      expect(getCanonicalSurnameLabel('Cohen')).toBe('Cohen');
    });

    it('trims whitespace from unknown surnames', () => {
      expect(getCanonicalSurnameLabel('  Levy  ')).toBe('Levy');
    });

    it('returns empty string for empty input', () => {
      expect(getCanonicalSurnameLabel('')).toBe('');
    });
  });
});
