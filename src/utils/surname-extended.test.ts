import { describe, it, expect } from 'vitest';
import { getCanonicalSurnameLabel } from './surname';

/**
 * Additional surname canonicalization tests covering more edge cases,
 * case sensitivity, and boundary conditions.
 */
describe('getCanonicalSurnameLabel – additional cases', () => {
  describe('case insensitivity', () => {
    it('maps "ALPEROVICH" (uppercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('ALPEROVICH')).toBe('Alperovich');
    });

    it('maps "alperovich" (lowercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('alperovich')).toBe('Alperovich');
    });

    it('maps "KASTREL" (uppercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('KASTREL')).toBe('Kastrel');
    });

    it('maps "duberstein" (lowercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('duberstein')).toBe('Duberstein');
    });

    it('maps "ZAIDMAN" (uppercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('ZAIDMAN')).toBe('Zaidman');
    });

    it('maps "VULIS" (uppercase) to cluster', () => {
      expect(getCanonicalSurnameLabel('VULIS')).toBe('Vulis');
    });
  });

  describe('Alperovich variant spelling coverage', () => {
    it('maps "Alperowitch" variant', () => {
      expect(getCanonicalSurnameLabel('Alperowitch')).toBe('Alperovich');
    });

    it('maps "Alperowicz" variant', () => {
      expect(getCanonicalSurnameLabel('Alperowicz')).toBe('Alperovich');
    });

    it('maps "Halperovitz" variant', () => {
      expect(getCanonicalSurnameLabel('Halperovitz')).toBe('Alperovich');
    });

    it('maps "Galperovitch" variant', () => {
      expect(getCanonicalSurnameLabel('Galperovitch')).toBe('Alperovich');
    });
  });

  describe('Kastrel variant spelling coverage', () => {
    it('maps "Castrelli" variant', () => {
      expect(getCanonicalSurnameLabel('Castrelli')).toBe('Kastrel');
    });

    it('maps "Kostrell" variant', () => {
      expect(getCanonicalSurnameLabel('Kostrell')).toBe('Kastrel');
    });

    it('maps "born Kastrel" prefix form', () => {
      expect(getCanonicalSurnameLabel('born Kastrel')).toBe('Kastrel');
    });
  });

  describe('Duberstein variant coverage', () => {
    it('maps "Dobertein" variant', () => {
      expect(getCanonicalSurnameLabel('Dobertein')).toBe('Duberstein');
    });

    it('maps "Dubertein" variant (missing s/h)', () => {
      expect(getCanonicalSurnameLabel('Dubertein')).toBe('Duberstein');
    });

    it('maps "Dubeshtein" variant', () => {
      expect(getCanonicalSurnameLabel('Dubeshtein')).toBe('Duberstein');
    });
  });

  describe('Zaidman variant coverage', () => {
    it('maps "Zeidmann" double-n variant', () => {
      expect(getCanonicalSurnameLabel('Zeidmann')).toBe('Zaidman');
    });

    it('maps "Seidman" (S prefix) variant', () => {
      expect(getCanonicalSurnameLabel('Seidman')).toBe('Zaidman');
    });
  });

  describe('Vulis variant coverage', () => {
    it('maps "Wulis" (W) variant', () => {
      expect(getCanonicalSurnameLabel('Wulis')).toBe('Vulis');
    });
  });

  describe('whitespace and special character handling', () => {
    it('handles leading/trailing whitespace', () => {
      expect(getCanonicalSurnameLabel('  Alperovich  ')).toBe('Alperovich');
    });

    it('handles whitespace-only input', () => {
      expect(getCanonicalSurnameLabel('   ')).toBe('');
    });

    it('handles surname with parentheses', () => {
      // Parentheses are replaced with spaces by normalizeForMatch
      expect(getCanonicalSurnameLabel('Alpert (Alperovitch)')).toBe('Alperovich');
    });

    it('preserves unknown surname with mixed case', () => {
      expect(getCanonicalSurnameLabel('  Smith  ')).toBe('Smith');
    });
  });

  describe('surnames that should NOT match any cluster', () => {
    it('does not match "Albert" to Alperovich', () => {
      expect(getCanonicalSurnameLabel('Albert')).toBe('Albert');
    });

    it('does not match "Castle" to Kastrel', () => {
      expect(getCanonicalSurnameLabel('Castle')).toBe('Castle');
    });

    it('does not match "Goldstein" to Duberstein', () => {
      expect(getCanonicalSurnameLabel('Goldstein')).toBe('Goldstein');
    });

    it('does not match "Goldman" to Zaidman', () => {
      expect(getCanonicalSurnameLabel('Goldman')).toBe('Goldman');
    });

    it('does not match "Julius" to Vulis', () => {
      expect(getCanonicalSurnameLabel('Julius')).toBe('Julius');
    });
  });
});
