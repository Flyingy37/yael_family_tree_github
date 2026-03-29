import { describe, it, expect } from 'vitest';
import { getCanonicalSurnameLabel } from './surname';

describe('getCanonicalSurnameLabel', () => {
  // Alperovich cluster
  it('maps Alperovich to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Alperovich')).toBe('Alperovich');
  });

  it('maps Alperovitch to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Alperovitch')).toBe('Alperovich');
  });

  it('maps Alperovitz to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Alperovitz')).toBe('Alperovich');
  });

  it('maps Halperovitch to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Halperovitch')).toBe('Alperovich');
  });

  it('maps Galperovitch to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Galperovitch')).toBe('Alperovich');
  });

  it('maps Hebrew אלפרוביץ to Alperovich', () => {
    expect(getCanonicalSurnameLabel('אלפרוביץ')).toBe('Alperovich');
  });

  it('maps Alpert (Alperovich) to Alperovich', () => {
    expect(getCanonicalSurnameLabel('Alpert (Alperovich)')).toBe('Alperovich');
  });

  // Kastrel cluster
  it('maps Kastrel to Kastrel', () => {
    expect(getCanonicalSurnameLabel('Kastrel')).toBe('Kastrel');
  });

  it('maps Castrol to Kastrel', () => {
    expect(getCanonicalSurnameLabel('Castrol')).toBe('Kastrel');
  });

  it('maps Kostrel to Kastrel', () => {
    expect(getCanonicalSurnameLabel('Kostrel')).toBe('Kastrel');
  });

  it('maps kastrel/castrel to Kastrel', () => {
    expect(getCanonicalSurnameLabel('kastrel/castrel')).toBe('Kastrel');
  });

  // Duberstein cluster
  it('maps Duberstein to Duberstein', () => {
    expect(getCanonicalSurnameLabel('Duberstein')).toBe('Duberstein');
  });

  it('maps Dubershtein to Duberstein', () => {
    expect(getCanonicalSurnameLabel('Dubershtein')).toBe('Duberstein');
  });

  it('maps Doberstein to Duberstein', () => {
    expect(getCanonicalSurnameLabel('Doberstein')).toBe('Duberstein');
  });

  // Zaidman cluster
  it('maps Zaidman to Zaidman', () => {
    expect(getCanonicalSurnameLabel('Zaidman')).toBe('Zaidman');
  });

  it('maps Zeidman to Zaidman', () => {
    expect(getCanonicalSurnameLabel('Zeidman')).toBe('Zaidman');
  });

  it('maps Seidman to Zaidman', () => {
    expect(getCanonicalSurnameLabel('Seidman')).toBe('Zaidman');
  });

  it('maps Seidmann to Zaidman', () => {
    expect(getCanonicalSurnameLabel('Seidmann')).toBe('Zaidman');
  });

  // Vulis cluster
  it('maps Vulis to Vulis', () => {
    expect(getCanonicalSurnameLabel('Vulis')).toBe('Vulis');
  });

  it('maps Wulis to Vulis', () => {
    expect(getCanonicalSurnameLabel('Wulis')).toBe('Vulis');
  });

  // Passthrough for unknown surnames
  it('returns unknown surname unchanged (trimmed)', () => {
    expect(getCanonicalSurnameLabel('Smith')).toBe('Smith');
  });

  it('returns trimmed value for a surname with surrounding spaces', () => {
    expect(getCanonicalSurnameLabel('  Cohen  ')).toBe('Cohen');
  });

  it('returns empty string for empty input', () => {
    expect(getCanonicalSurnameLabel('')).toBe('');
  });

  it('treats a string of only spaces as empty', () => {
    expect(getCanonicalSurnameLabel('   ')).toBe('');
  });
});
