function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[^a-z\u0590-\u05ff\u0400-\u04ff\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCanonicalSurnameLabel(value: string): string {
  const normalized = normalizeForMatch(value);
  if (!normalized) return '';

  // Family transliteration cluster: Alperovich and common Latin/Hebrew/Cyrillic variants.
  if (
    /(^|\s)(?:alperov|alperow|alperv|halperov|galperov)(?:ich|itch|itz|itsh|icz)(\s|$)/.test(normalized) ||
    normalized.includes('אלפרוב') ||
    normalized.includes('алперов')
  ) {
    return 'Alperovich';
  }

  // Mixed forms such as "Alpert (Alperovich)" should aggregate with the Alperovich cluster.
  if (normalized.includes('alpert') && normalized.includes('alperov')) {
    return 'Alperovich';
  }

  // Family transliteration cluster: Kastrel / Castroll / Castro / Kostrell and close variants.
  if (
    /(^|\s)(?:born\s+)?(?:kastr|castr|kostr)[a-z/]*?(\s|$)/.test(normalized) ||
    normalized.includes('kastrel/castrel')
  ) {
    return 'Kastrel';
  }

  // Family transliteration cluster: Duberstein / Dubershtein / Doberstein variants.
  if (/(^|\s)d[ou]ber?s?h?tein(\s|$)/.test(normalized)) {
    return 'Duberstein';
  }

  // Family transliteration cluster: Zaidman / Zeidman / Seidman / Seidmann variants.
  if (
    /(^|\s)(?:z|s)e?idman+n?(\s|$)/.test(normalized) ||
    /(^|\s)zaidman+n?(\s|$)/.test(normalized)
  ) {
    return 'Zaidman';
  }

  // Family transliteration cluster: Vulis / Wulis / hyphenated forms.
  if (/(^|\s)[vw]ulis(\s|$)/.test(normalized) || normalized.includes('vulis')) {
    return 'Vulis';
  }

  return value.trim();
}
