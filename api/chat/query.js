/**
 * Vercel Serverless Function — /api/chat/query
 *
 * GET  → health check
 * POST → { query: string } → answer about the family tree
 *
 * Pipeline (no OpenAI key):
 *   1. normalizeText(query)
 *   2. detectIntent(query)           → { intent, isCountQuery }
 *   3. extractNameTokens(query)      → anchor-phrase-first, then token fallback
 *   4. findPersonByName(tokens)      → phonetic Hebrew↔English matching
 *   5. computeRelatives(intent, person, graph)
 *   6. formatAnswer(result)
 *
 * With OPENAI_API_KEY: builds enriched context (with relationships) → GPT-4o-mini.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

// ── network / CORS ────────────────────────────────────────────────────────────

const DNA_KEYWORDS = ['dna', 'DNA', 'קוסטר', 'אלפר', 'גינזבורג'];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function loadJson(filename) {
  const filePath = join(process.cwd(), 'public', filename);
  return JSON.parse(await readFile(filePath, 'utf8'));
}

// ── Layer 1: text normalisation ───────────────────────────────────────────────

function normalizeText(input) {
  return String(input ?? '')
    .normalize('NFKC')
    .replace(/[״"'"'׳]/g, '')
    .replace(/[?.!,;:()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ── Layer 2: intent detection ─────────────────────────────────────────────────

const INTENT_PATTERNS = {
  total_count: [
    /כמה\s+אנש/, /how\s+many\s+people/, /total\s+people/,
  ],
  children: [
    /מי\s+ה?ילד/, /מי\s+ה?בנ/, /כמה\s+ילד/, /כמה\s+בנ/,
    /יש\s+.*ילד/, /who\s+are.*child/, /how\s+many.*child/,
  ],
  parents: [
    /מי\s+ה?הורים/, /מי\s+ה?אבא/, /מי\s+ה?אמא/, /מי\s+אב[יה]/,
    /who\s+are.*parents?/, /who\s+(is|are).*father/, /who\s+(is|are).*mother/,
  ],
  siblings: [
    /מי\s+ה?אחים/, /מי\s+ה?אחיות/, /מי\s+ה?אח\b/, /כמה\s+אחים/, /כמה\s+אח\b/,
    /יש\s+.*אחים/, /who\s+are.*siblings?/, /how\s+many.*siblings?/,
  ],
  spouse: [
    /מי\s+.*בעל/, /מי\s+.*אישה/, /מי\s+.*בן\s+זוג/, /מי\s+.*בת\s+זוג/,
    /נשוי\s+ל/, /נשואה\s+ל/, /who\s+.*spouse/, /who\s+.*married/, /who\s+.*husband/, /who\s+.*wife/,
  ],
  grandparents: [
    /מי\s+ה?סבא/, /מי\s+ה?סבתא/, /מי\s+ה?סבים/, /מי\s+ה?סבתות/,
    /who\s+are.*grandparents?/, /who\s+(is|are).*grandfather/, /who\s+(is|are).*grandmother/,
  ],
  birth: [
    /מתי\s+נולד/, /תאריך\s+לידה/, /מאיפה/, /איפה\s+נולד/, /when.*born/, /birth\s+(date|place)/,
  ],
  death: [
    /מתי\s+נפטר/, /תאריך\s+פטירה/, /when.*died/, /death\s+date/,
  ],
  about: [
    /ספר\s+.*על/, /מה\s+ידוע/, /מה\s+אתה\s+יודע/, /tell\s+me\s+about/, /who\s+is\b/, /info\s+on/,
  ],
  countries: [
    /אילו\s+מדינות/, /כמה\s+מדינות/, /which\s+countries/, /how\s+many\s+countries/, /from\s+where/,
  ],
};

function detectIntent(query) {
  const q = normalizeText(query);
  const isCountQuery = /\bכמה\b|\bhow\s+many\b/.test(q);

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(rx => rx.test(q))) return { intent, isCountQuery };
  }
  return { intent: 'unknown', isCountQuery };
}

// ── Layer 3: name token extraction ────────────────────────────────────────────

function stripHebrewPrefix(word) {
  const stripped = word.replace(/^[לבהמוכש]/, '');
  // Only strip if the result is still meaningful (≥2 chars)
  return stripped.length >= 2 ? stripped : word;
}

const STOP_WORDS = new Set([
  // Hebrew question words
  'כמה', 'מי', 'מה', 'איפה', 'מאיפה', 'מתי', 'איך', 'כיצד', 'האם',
  // Hebrew function words
  'יש', 'היה', 'היתה', 'הוא', 'היא', 'הם', 'הן', 'זה', 'זאת', 'זו',
  'של', 'על', 'את', 'עם', 'אל', 'מן', 'לפני', 'אחרי', 'לגבי', 'עבור',
  'לי', 'לו', 'לה', 'לנו', 'נא', 'בבקשה',
  // Hebrew relationship words (used as intent keywords, not names)
  'ילדים', 'ילד', 'ילדה', 'בנים', 'בת', 'בנות',
  'הורים', 'אמא', 'אבא', 'אב', 'אם',
  'אחים', 'אחות', 'אח', 'אחיות',
  'סבא', 'סבתא', 'סבים', 'סבתות', 'סב', 'סבתה',
  'נשוי', 'נשואה', 'בעל', 'אישה', 'זוג',
  'נכדים', 'נכד', 'נכדה',
  // English stop words
  'how', 'many', 'who', 'what', 'where', 'when', 'why',
  'children', 'child', 'parents', 'siblings', 'sibling',
  'grandparents', 'grandfather', 'grandmother',
  'father', 'mother', 'husband', 'wife', 'spouse',
  'the', 'of', 'in', 'is', 'are', 'has', 'have', 'does', 'for',
]);

/**
 * Extract name tokens from a query.
 *
 * Strategy (in order):
 *   1. Anchor phrases: "של [NAME]" or "[של|ל|for|of] at end of sentence"
 *      — most reliable; captures "מי האחים של יעל ליבנת" → ["יעל", "ליבנת"]
 *   2. Token fallback: strip prefixes + filter stop words
 */
function extractNameTokens(query) {
  const normalized = normalizeText(query);

  // Anchor patterns — capture the name portion after common prepositions.
  // NOTE: \b does not work with Hebrew (Hebrew chars are non-word chars in JS regex),
  // so we use (?:^|\s) as the word boundary equivalent.
  const ANCHOR_PATTERNS = [
    /(?:^|\s)של\s+([\u05D0-\u05FAa-z]+(?:\s+[\u05D0-\u05FAa-z]+){0,3})$/,
    /(?:^|\s)for\s+([a-z]+(?:\s+[a-z]+){0,3})$/,
    /(?:^|\s)of\s+([a-z]+(?:\s+[a-z]+){0,3})$/,
  ];

  for (const pattern of ANCHOR_PATTERNS) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const tokens = match[1].split(' ')
        .map(w => stripHebrewPrefix(w))
        .filter(w => w.length > 1 && !STOP_WORDS.has(w));
      if (tokens.length) return tokens;
    }
  }

  // Prefix-based: handle "למשה" / "ליעל" patterns at end of sentence.
  // Matches a ל/ב-prefixed Hebrew word (or sequence) at the end of the query.
  const prefixMatch = normalized.match(/(?:^|\s)[לב]([\u05D0-\u05FA]{2,}(?:\s+[\u05D0-\u05FA]{2,}){0,2})\s*$/);
  if (prefixMatch?.[1]) {
    const tokens = prefixMatch[1].split(' ')
      .filter(w => w.length > 1 && !STOP_WORDS.has(w));
    if (tokens.length) return tokens;
  }

  // Fallback: all non-stop tokens after prefix stripping
  return query
    .replace(/[?.,!״"']/g, '')
    .split(/\s+/)
    .map(w => stripHebrewPrefix(w.toLowerCase()))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// ── Layer 4: phonetic Hebrew↔English person matching ─────────────────────────

const HEBREW_CONSONANT_MAP = {
  'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': '', 'ו': 'v',
  'ז': 'z', 'ח': 'h', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k',
  'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
  'ע': '',  'פ': 'p', 'ף': 'f', 'צ': 'ts','ץ': 'ts','ק': 'k',
  'ר': 'r', 'ש': 'sh','ת': 't',
};

function hebrewToConsonants(word) {
  return word.split('').map(c => HEBREW_CONSONANT_MAP[c] ?? '').join('');
}

function latinConsonants(str) {
  return str.toLowerCase().replace(/[aeiou\s\-'.,]/g, '');
}

function phoneticMatchHE(hebrewToken, englishStr) {
  if (!hebrewToken || hebrewToken.length < 2) return false;
  const hKey    = hebrewToConsonants(hebrewToken);
  const hKeyNoY = hKey.replace(/y/g, '');        // handles mid-word vowel-marker י
  const eKey    = latinConsonants(englishStr);
  if (hKey.length >= 2    && eKey.includes(hKey))    return true;
  if (hKeyNoY.length >= 2 && eKey.includes(hKeyNoY)) return true;
  return false;
}

function scorePersonMatch(person, queryTokens) {
  const fields = [
    person.fullName, person.hebrewName, person.givenName,
    person.surname, person.surnameFinal, person.birthName,
  ].filter(Boolean).join(' ');
  const lower = fields.toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (token.length < 2) continue;
    if (lower.includes(token)) {
      score += 2;
    } else if (phoneticMatchHE(token, fields)) {
      score += 1;
    }
  }
  return score;
}

/**
 * Find the best person match for the given name tokens.
 *
 * Scoring: 2pts for direct substring match, 1pt for phonetic match.
 * Tiebreaker: array position (stable sort) — person[0] is typically the root/most-central.
 * No ambiguity guard: when multiple people share a first name, the one with the higher
 * total score wins; on a true tie the root person (first in array) is preferred.
 */
function findPersonByName(nameTokens, persons) {
  if (!nameTokens.length) return null;

  // Map to [index, person, score] to preserve array order as tiebreaker
  const scored = persons
    .map((p, i) => ({ p, i, score: scorePersonMatch(p, nameTokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i); // score desc, then array order asc

  return scored.length ? scored[0].p : null;
}

// ── Layer 5: compute relatives (correct field names from graph data) ───────────
//
//   graph families use:  family.spouses  = [personId, ...]
//                        family.children = [personId, ...]
//   person record uses:  person.familiesAsSpouse = [familyId, ...]
//                        person.familyAsChild    = familyId | null

function buildGraphMaps(persons, families) {
  return {
    personMap: new Map(persons.map(p => [p.id, p])),
    familyMap: new Map(families.map(f => [f.id, f])),
  };
}

function getChildren(person, familyMap, personMap) {
  const ids = (person.familiesAsSpouse ?? []).flatMap(fid =>
    familyMap.get(fid)?.children ?? []
  );
  return [...new Set(ids)].map(id => personMap.get(id)).filter(Boolean);
}

function getParents(person, familyMap, personMap) {
  const fam = person.familyAsChild ? familyMap.get(person.familyAsChild) : null;
  return (fam?.spouses ?? []).map(id => personMap.get(id)).filter(Boolean);
}

function getSiblings(person, familyMap, personMap) {
  const fam = person.familyAsChild ? familyMap.get(person.familyAsChild) : null;
  return (fam?.children ?? [])
    .filter(id => id !== person.id)
    .map(id => personMap.get(id))
    .filter(Boolean);
}

function getSpouses(person, familyMap, personMap) {
  const ids = (person.familiesAsSpouse ?? []).flatMap(fid =>
    (familyMap.get(fid)?.spouses ?? []).filter(id => id !== person.id)
  );
  return [...new Set(ids)].map(id => personMap.get(id)).filter(Boolean);
}

function getGrandparents(person, familyMap, personMap) {
  const parents = getParents(person, familyMap, personMap);
  const seen = new Set();
  return parents
    .flatMap(p2 => getParents(p2, familyMap, personMap))
    .filter(gp => {
      if (seen.has(gp.id)) return false;
      seen.add(gp.id);
      return true;
    });
}

// ── Layer 6: format answer ────────────────────────────────────────────────────

function formatRelativesList(relatives) {
  return relatives.map(r => {
    const parts = [r.fullName];
    if (r.birthDate) parts.push(`(${r.birthDate})`);
    return parts.join(' ');
  }).join('\n');
}

// ── Structured answer orchestrator ───────────────────────────────────────────

function structuredAnswer(query, persons, families) {
  const { intent, isCountQuery } = detectIntent(query);
  const nameTokens = extractNameTokens(query);
  const { personMap, familyMap } = buildGraphMaps(persons, families);

  // ── intent: total count (no person needed) ────────────────────────────────
  if (intent === 'total_count') {
    return { answer: `בעץ המשפחה יש ${persons.length} אנשים.`, personId: null };
  }

  // ── intent: countries (no person needed) ─────────────────────────────────
  if (intent === 'countries') {
    const countryCount = new Map();
    for (const p of persons) {
      if (!p.birthPlace) continue;
      const parts = p.birthPlace.split(',');
      const country = parts[parts.length - 1].trim();
      countryCount.set(country, (countryCount.get(country) ?? 0) + 1);
    }
    if (!countryCount.size) return null;
    const sorted = [...countryCount.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 10).map(([c, n]) => `${c}: ${n} אנשים`);
    return {
      answer: `מקומות לידה בגרף (${countryCount.size} מיקומים):\n${top.join('\n')}` +
        (sorted.length > 10 ? `\n…ועוד ${sorted.length - 10} מיקומים.` : ''),
      personId: null,
    };
  }

  // ── intents requiring a person ────────────────────────────────────────────
  if (intent === 'unknown') return null;

  const person = findPersonByName(nameTokens, persons);

  if (!person) {
    // If we had tokens but got null back → ambiguous
    if (nameTokens.length) {
      return {
        answer: `נמצאו מספר אנשים בשם זה. אנא ציין/י שם מלא יותר.`,
        personId: null,
      };
    }
    return null;
  }

  const name = person.fullName;

  switch (intent) {
    case 'children': {
      const children = getChildren(person, familyMap, personMap);
      if (!children.length) return { answer: `ל${name} אין ילדים רשומים.`, personId: person.id };
      if (isCountQuery) {
        return {
          answer: `ל${name} יש ${children.length} ילדים: ${children.map(c => c.fullName).join(', ')}.`,
          personId: person.id,
        };
      }
      return { answer: `ילדי ${name}:\n${formatRelativesList(children)}`, personId: person.id };
    }

    case 'parents': {
      const parents = getParents(person, familyMap, personMap);
      if (!parents.length) return { answer: `לא נמצאו הורים רשומים עבור ${name}.`, personId: person.id };
      return { answer: `הורי ${name}:\n${parents.map(p2 => p2.fullName).join('\n')}`, personId: person.id };
    }

    case 'siblings': {
      const siblings = getSiblings(person, familyMap, personMap);
      if (!siblings.length) return { answer: `${name} הוא/היא ילד/ה יחיד/ה במשפחה.`, personId: person.id };
      if (isCountQuery) {
        return {
          answer: `ל${name} יש ${siblings.length} אחים/אחיות: ${siblings.map(s => s.fullName).join(', ')}.`,
          personId: person.id,
        };
      }
      return { answer: `אחים/אחיות של ${name}:\n${formatRelativesList(siblings)}`, personId: person.id };
    }

    case 'spouse': {
      const spouses = getSpouses(person, familyMap, personMap);
      if (!spouses.length) return { answer: `לא נמצא/ה בן/בת זוג עבור ${name}.`, personId: person.id };
      return { answer: `בן/בת הזוג של ${name}: ${spouses.map(s => s.fullName).join(', ')}.`, personId: person.id };
    }

    case 'grandparents': {
      const gps = getGrandparents(person, familyMap, personMap);
      if (!gps.length) return { answer: `לא נמצאו סבים/סבתות רשומים עבור ${name}.`, personId: person.id };
      return { answer: `סבים/סבתות של ${name}:\n${gps.map(g => g.fullName).join('\n')}`, personId: person.id };
    }

    case 'birth': {
      const parts = [];
      if (person.birthDate)  parts.push(`תאריך לידה: ${person.birthDate}`);
      if (person.birthPlace) parts.push(`מקום לידה: ${person.birthPlace}`);
      if (!parts.length) return { answer: `לא נמצאו פרטי לידה עבור ${name}.`, personId: person.id };
      return { answer: `${name}:\n${parts.join('\n')}`, personId: person.id };
    }

    case 'death': {
      if (!person.deathDate) return { answer: `לא נמצאו פרטי פטירה עבור ${name}.`, personId: person.id };
      return { answer: `${name} נפטר/ה: ${person.deathDate}.`, personId: person.id };
    }

    case 'about': {
      const children = getChildren(person, familyMap, personMap);
      const parents  = getParents(person, familyMap, personMap);
      const spouses  = getSpouses(person, familyMap, personMap);
      const parts    = [`**${name}**`];
      if (person.hebrewName) parts.push(`שם עברי: ${person.hebrewName}`);
      if (person.birthDate || person.birthPlace)
        parts.push(`נולד/ה: ${[person.birthDate, person.birthPlace].filter(Boolean).join(', ')}`);
      if (person.deathDate) parts.push(`נפטר/ה: ${person.deathDate}`);
      if (parents.length)   parts.push(`הורים: ${parents.map(p2 => p2.fullName).join(', ')}`);
      if (spouses.length)   parts.push(`בן/בת זוג: ${spouses.map(s => s.fullName).join(', ')}`);
      if (children.length)  parts.push(`ילדים (${children.length}): ${children.map(c => c.fullName).join(', ')}`);
      if (person.relationToYael) parts.push(`קשר לשורש: ${person.relationToYael}`);
      if (person.note_plain) parts.push(person.note_plain.slice(0, 300));
      return { answer: parts.join('\n'), personId: person.id };
    }

    default:
      return null;
  }
}

// ── keyword search (last-resort fallback) ─────────────────────────────────────

function keywordSearch(query, persons) {
  const tokens = extractNameTokens(query).filter(w => w.length > 2);
  if (!tokens.length) return null;

  const hits = persons.filter(p => {
    const blob = [
      p.fullName, p.hebrewName, p.birthName,
      p.birthPlace, p.note_plain, p.story, p.relationToYael,
    ].filter(Boolean).join(' ').toLowerCase();
    return tokens.some(word => blob.includes(word) || phoneticMatchHE(word, blob));
  });

  if (!hits.length) return null;

  if (hits.length <= 2) {
    return hits.map(p => {
      const parts = [`**${p.fullName}**`];
      if (p.hebrewName)   parts.push(`(${p.hebrewName})`);
      if (p.birthDate || p.birthPlace)
        parts.push(`נולד/ה: ${[p.birthDate, p.birthPlace].filter(Boolean).join(', ')}`);
      if (p.deathDate)    parts.push(`נפטר/ה: ${p.deathDate}`);
      if (p.relationToYael) parts.push(`קשר לשורש: ${p.relationToYael}`);
      return parts.join('\n');
    }).join('\n\n');
  }

  const lines = hits.slice(0, 5).map(p => {
    const parts = [p.fullName];
    if (p.birthDate)  parts.push(`נולד/ה ${p.birthDate}`);
    if (p.birthPlace) parts.push(`ב${p.birthPlace}`);
    if (p.deathDate)  parts.push(`נפטר/ה ${p.deathDate}`);
    if (p.relationToYael) parts.push(`(${p.relationToYael})`);
    return parts.join(', ');
  });
  return `נמצאו ${hits.length} תוצאות:\n${lines.join('\n')}` +
    (hits.length > 5 ? `\n…ועוד ${hits.length - 5} תוצאות.` : '');
}

// ── OpenAI path ───────────────────────────────────────────────────────────────

async function openAiAnswer(query, context) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `אתה עוזר מחקר גנאולוגי למשפחת ליבנת-זיידמן.
ענה בעברית בצורה תמציתית ומדויקת, בהתבסס אך ורק על הנתונים שסופקו.
אם המידע אינו מספיק — אמור "לא נמצא מידע מספיק". אל תמציא עובדות.`,
        },
        { role: 'user', content: `שאלה: ${query}\n\nנתונים:\n${context}` },
      ],
      max_tokens: 400,
      temperature: 0.2,
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

function buildContext(query, persons, families, dnaMatches) {
  const nameTokens = extractNameTokens(query);
  const { personMap, familyMap } = buildGraphMaps(persons, families);

  const relevant = persons.filter(p => {
    const blob = [p.fullName, p.hebrewName, p.birthName, p.birthPlace, p.note_plain]
      .filter(Boolean).join(' ').toLowerCase();
    return nameTokens.some(w => blob.includes(w) || phoneticMatchHE(w, blob));
  }).slice(0, 10);

  const root = persons.find(p => p.id === dnaMatches?.meta?.rootPersonId) ?? persons[0];

  const personLines = [...new Set([root, ...relevant].filter(Boolean))].map(p => {
    const children = getChildren(p, familyMap, personMap);
    const parents  = getParents(p, familyMap, personMap);
    return [
      `שם: ${p.fullName}`,
      p.hebrewName  ? `שם עברי: ${p.hebrewName}` : null,
      p.birthDate   ? `לידה: ${p.birthDate}` : null,
      p.birthPlace  ? `מקום לידה: ${p.birthPlace}` : null,
      p.deathDate   ? `פטירה: ${p.deathDate}` : null,
      parents.length  ? `הורים: ${parents.map(x => x.fullName).join(', ')}` : null,
      children.length ? `ילדים (${children.length}): ${children.map(x => x.fullName).join(', ')}` : null,
      p.relationToYael ? `קשר לשורש: ${p.relationToYael}` : null,
      p.note_plain  ? `הערות: ${p.note_plain.slice(0, 200)}` : null,
    ].filter(Boolean).join(' | ');
  });

  const q = query.toLowerCase();
  let dnaContext = '';
  if (DNA_KEYWORDS.some(k => q.includes(k.toLowerCase())) && dnaMatches?.matches) {
    const dnaLines = dnaMatches.matches.slice(0, 5).map(m =>
      `${m.name}: ${m.sharedCm} cM, ${m.relationship ?? ''}, ענף: ${m.branch ?? ''}`
    );
    dnaContext = '\nהתאמות DNA:\n' + dnaLines.join('\n');
  }

  return [`סה"כ ${persons.length} אנשים בגרף.`, ...personLines].join('\n') + dnaContext;
}

// ── main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  console.log('[chat/query] method:', req.method);
  cors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET')     return res.status(200).json({ ok: true, message: 'Family chat API is running.' });
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or empty query field.' });
  }

  try {
    const [graph, dnaData] = await Promise.all([
      loadJson('family-graph.json'),
      loadJson('dna-matches.json').catch(() => null),
    ]);

    const persons  = Array.isArray(graph.persons)  ? graph.persons  : Object.values(graph.persons  ?? {});
    const families = Array.isArray(graph.families) ? graph.families : Object.values(graph.families ?? {});

    let answer, source, personId = null;

    if (process.env.OPENAI_API_KEY) {
      const context = buildContext(query.trim(), persons, families, dnaData);
      answer   = await openAiAnswer(query.trim(), context);
      source   = 'openai';
      personId = findPersonByName(extractNameTokens(query.trim()), persons)?.id ?? null;
    } else {
      const structured = structuredAnswer(query.trim(), persons, families);
      if (structured) {
        answer   = structured.answer;
        personId = structured.personId;
        source   = 'structured';
      } else {
        answer   = keywordSearch(query.trim(), persons);
        source   = 'keyword';
        personId = findPersonByName(extractNameTokens(query.trim()), persons)?.id ?? null;
      }
    }

    if (!answer) {
      return res.status(200).json({
        ok: true,
        answer: 'לא נמצאה התאמה ברורה. נסה/י לנסח מחדש, או ציין/י שם מלא.',
        source: source ?? 'none',
        personId: null,
      });
    }

    return res.status(200).json({ ok: true, answer, source, personId });
  } catch (err) {
    console.error('[chat/query]', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
