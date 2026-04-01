/**
 * Vercel Serverless Function — /api/chat/query
 *
 * GET  → health check, returns { ok: true }
 * POST → { query: string } → answer about the family tree
 *
 * Without OPENAI_API_KEY: uses smart structural + phonetic-matched keyword answers.
 * With OPENAI_API_KEY: builds family context and calls GPT-4o-mini.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

// ── helpers ──────────────────────────────────────────────────────────────────

const DNA_KEYWORDS = ['dna', 'DNA', 'קוסטר', 'אלפר', 'גינזבורג'];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function loadJson(filename) {
  const filePath = join(process.cwd(), 'public', filename);
  const text = await readFile(filePath, 'utf8');
  return JSON.parse(text);
}

// ── phonetic Hebrew↔English matching ─────────────────────────────────────────

/**
 * Convert a Hebrew word to its approximate Latin consonant representation.
 * Used to bridge queries typed in Hebrew to English names in the data.
 *
 * Rules:
 *  - Map each Hebrew consonant to its Latin equivalent.
 *  - א, ה, ע, ו, י → '' (silent / vowel markers in this context)
 *    EXCEPT: initial י → 'y', initial ו → 'v'
 *  - After building the key, also generate a "no-y" variant to handle
 *    cases where י is used as a vowel marker mid-word (e.g. זיידמן → zdmn).
 */
const HEBREW_CONSONANT_MAP = {
  'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': '', 'ו': 'v',
  'ז': 'z', 'ח': 'h', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k',
  'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
  'ע': '', 'פ': 'p', 'ף': 'f', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k',
  'ר': 'r', 'ש': 'sh', 'ת': 't',
};

function hebrewToConsonants(word) {
  return word.split('').map(c => HEBREW_CONSONANT_MAP[c] ?? '').join('');
}

/** Remove vowels and separators from a Latin string to get consonant skeleton. */
function latinConsonants(str) {
  return str.toLowerCase().replace(/[aeiou\s\-'.,]/g, '');
}

/**
 * Returns true if `hebrewToken` plausibly refers to a name part in `englishStr`.
 * Uses two phonetic keys:
 *   1. Full consonant key (e.g. יעל → "yl")
 *   2. No-y variant (e.g. זיידמן → "zdmn") — handles mid-word vowel markers.
 */
function phoneticMatchHE(hebrewToken, englishStr) {
  if (!hebrewToken || hebrewToken.length < 2) return false;
  const hKey = hebrewToConsonants(hebrewToken);
  const hKeyNoY = hKey.replace(/y/g, '');
  const eKey = latinConsonants(englishStr);
  if (hKey.length >= 2 && eKey.includes(hKey)) return true;
  if (hKeyNoY.length >= 2 && eKey.includes(hKeyNoY)) return true;
  return false;
}

// ── strip Hebrew prefix ───────────────────────────────────────────────────────

function stripHebrewPrefix(word) {
  return word.replace(/^[לבהמוכש]/, '');
}

// ── stop words ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'כמה', 'מי', 'מה', 'איפה', 'מאיפה', 'מתי', 'איך', 'כיצד',
  'יש', 'היה', 'היתה', 'יהיה', 'הם', 'הן', 'הוא', 'היא',
  'ילדים', 'ילד', 'ילדה', 'בנים', 'בן', 'בת', 'בנות',
  'הורים', 'אמא', 'אבא', 'אב', 'אם', 'אחים', 'אחות', 'אח',
  'סבא', 'סבתא', 'נכדים', 'נכד', 'נכדה',
  'נשוי', 'נשואה', 'בעל', 'אישה', 'זוג',
  'של', 'על', 'את', 'עם', 'אל', 'מן', 'לפני', 'אחרי',
  'how', 'many', 'who', 'what', 'where', 'when', 'children',
  'parents', 'siblings', 'grandparents', 'the', 'of', 'in',
  'is', 'are', 'has', 'have',
]);

function extractNameTokens(query) {
  return query
    .replace(/[?.,!״"']/g, '')
    .split(/\s+/)
    .map(w => stripHebrewPrefix(w.toLowerCase()))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// ── person finder ─────────────────────────────────────────────────────────────

/**
 * Find the best-matching person given name tokens extracted from the query.
 * Supports both direct substring match (for Latin/English data) and phonetic
 * Hebrew→Latin match (for Hebrew queries against English-named data).
 */
function findPersonByName(nameTokens, persons) {
  if (!nameTokens.length) return null;

  const scored = persons.map(p => {
    const fields = [p.fullName, p.hebrewName, p.givenName, p.surname, p.surnameFinal, p.birthName]
      .filter(Boolean).join(' ');
    const fieldLower = fields.toLowerCase();

    let score = 0;
    for (const token of nameTokens) {
      if (token.length < 2) continue;
      // Direct match (works for English tokens or when hebrewName is populated)
      if (fieldLower.includes(token)) {
        score += 2;
        continue;
      }
      // Phonetic Hebrew→English match
      if (phoneticMatchHE(token, fields)) {
        score += 1;
      }
    }
    return { p, score };
  }).filter(x => x.score > 0);

  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].p;
}

// ── structured answers ────────────────────────────────────────────────────────

/**
 * Attempt to answer structural/relational queries directly from graph data.
 * Returns { answer, personId } or null if no structured answer is applicable.
 *
 * Family data shape (from family-graph.json):
 *   family.spouses  = [personId, ...]
 *   family.children = [personId, ...]
 *   person.familiesAsSpouse = [familyId, ...]
 *   person.familyAsChild    = familyId | null
 */
function structuredAnswer(query, persons, families) {
  const q = query.toLowerCase();
  const nameTokens = extractNameTokens(query);

  const personMap = new Map(persons.map(p => [p.id, p]));
  const familyMap = new Map(families.map(f => [f.id, f]));

  // ── helpers using the correct field names ──────────────────────────────────

  function getChildren(person) {
    const spouseFamIds = person.familiesAsSpouse ?? [];
    const allIds = spouseFamIds.flatMap(fid => {
      const fam = familyMap.get(fid);
      return fam?.children ?? [];
    });
    return [...new Set(allIds)].map(id => personMap.get(id)).filter(Boolean);
  }

  function getParents(person) {
    const fam = person.familyAsChild ? familyMap.get(person.familyAsChild) : null;
    return (fam?.spouses ?? []).map(id => personMap.get(id)).filter(Boolean);
  }

  function getSiblings(person) {
    const fam = person.familyAsChild ? familyMap.get(person.familyAsChild) : null;
    return (fam?.children ?? [])
      .filter(id => id !== person.id)
      .map(id => personMap.get(id))
      .filter(Boolean);
  }

  function getSpouses(person) {
    const spouseFamIds = person.familiesAsSpouse ?? [];
    const spouseIds = spouseFamIds.flatMap(fid => {
      const fam = familyMap.get(fid);
      return (fam?.spouses ?? []).filter(id => id !== person.id);
    });
    return [...new Set(spouseIds)].map(id => personMap.get(id)).filter(Boolean);
  }

  // ── total count ────────────────────────────────────────────────────────────
  if (/כמה\s+אנש|how\s+many\s+people|total\s+people/.test(q)) {
    return { answer: `בעץ המשפחה יש ${persons.length} אנשים.`, personId: null };
  }

  // ── children ───────────────────────────────────────────────────────────────
  if (/כמה\s+ילד|כמה\s+בנ|מי\s+ה?ילד|מי\s+ה?בנ|how\s+many\s+child|who\s+are\s+.*child/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const children = getChildren(person);
      if (!children.length) {
        return { answer: `ל${person.fullName} אין ילדים רשומים בגרף.`, personId: person.id };
      }
      const nameList = children.map(c => c.fullName).join(', ');
      if (/כמה|how\s+many/.test(q)) {
        return {
          answer: `ל${person.fullName} יש ${children.length} ילדים: ${nameList}.`,
          personId: person.id,
        };
      }
      const lines = children.map(c => {
        const parts = [c.fullName];
        if (c.birthDate) parts.push(`(${c.birthDate})`);
        return parts.join(' ');
      });
      return { answer: `ילדי ${person.fullName}:\n${lines.join('\n')}`, personId: person.id };
    }
  }

  // ── parents ────────────────────────────────────────────────────────────────
  if (/מי\s+ה?הורים|מי\s+ה?אבא|מי\s+ה?אמא|מי\s+אב[יה]|who\s+are.*parents|parent.*of/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const parents = getParents(person);
      if (!parents.length) {
        return { answer: `לא נמצאו הורים רשומים עבור ${person.fullName}.`, personId: person.id };
      }
      const lines = parents.map(p2 => p2.fullName);
      return { answer: `הורי ${person.fullName}:\n${lines.join('\n')}`, personId: person.id };
    }
  }

  // ── siblings ───────────────────────────────────────────────────────────────
  if (/מי\s+ה?אח|כמה\s+אח|who\s+are.*sibling|how\s+many.*sibling/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const siblings = getSiblings(person);
      if (!siblings.length) {
        return { answer: `${person.fullName} הוא/היא ילד/ה יחיד/ה במשפחה.`, personId: person.id };
      }
      if (/כמה|how\s+many/.test(q)) {
        return {
          answer: `ל${person.fullName} יש ${siblings.length} אחים/אחיות: ${siblings.map(s => s.fullName).join(', ')}.`,
          personId: person.id,
        };
      }
      return {
        answer: `אחים/אחיות של ${person.fullName}:\n${siblings.map(s => s.fullName).join('\n')}`,
        personId: person.id,
      };
    }
  }

  // ── spouse ─────────────────────────────────────────────────────────────────
  if (/מי\s+.*בעל|מי\s+.*אישה|מי\s+.*זוג|נשוי|נשואה|who\s+.*spouse|who\s+.*married/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const spouses = getSpouses(person);
      if (!spouses.length) {
        return { answer: `לא נמצא/ה בן/בת זוג רשום/ה עבור ${person.fullName}.`, personId: person.id };
      }
      return {
        answer: `בן/בת הזוג של ${person.fullName}: ${spouses.map(s => s.fullName).join(', ')}.`,
        personId: person.id,
      };
    }
  }

  // ── birth / death ──────────────────────────────────────────────────────────
  if (/מתי\s+נולד|תאריך\s+לידה|when.*born|birth\s+date/.test(q) ||
      /מתי\s+נפטר|תאריך\s+פטירה|when.*died|death\s+date/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const isBirth = /נולד|born|birth/.test(q);
      const isDeath = /נפטר|died|death/.test(q);
      const parts = [];
      if (isBirth && person.birthDate) parts.push(`תאריך לידה: ${person.birthDate}`);
      if (isBirth && person.birthPlace) parts.push(`מקום לידה: ${person.birthPlace}`);
      if (isDeath && person.deathDate) parts.push(`תאריך פטירה: ${person.deathDate}`);
      if (!parts.length) {
        return { answer: `לא נמצאו פרטי לידה/פטירה עבור ${person.fullName}.`, personId: person.id };
      }
      return { answer: `${person.fullName}:\n${parts.join('\n')}`, personId: person.id };
    }
  }

  // ── general person lookup ──────────────────────────────────────────────────
  if (/ספר|מה\s+אתה\s+יודע|מה\s+ידוע|tell\s+me\s+about|info\s+on|who\s+is/.test(q)) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const children = getChildren(person);
      const parents = getParents(person);
      const spouses = getSpouses(person);
      const parts = [`**${person.fullName}**`];
      if (person.hebrewName) parts.push(`שם עברי: ${person.hebrewName}`);
      if (person.birthDate || person.birthPlace) {
        parts.push(`נולד/ה: ${[person.birthDate, person.birthPlace].filter(Boolean).join(', ')}`);
      }
      if (person.deathDate) parts.push(`נפטר/ה: ${person.deathDate}`);
      if (parents.length) parts.push(`הורים: ${parents.map(p2 => p2.fullName).join(', ')}`);
      if (spouses.length) parts.push(`בן/בת זוג: ${spouses.map(s => s.fullName).join(', ')}`);
      if (children.length) parts.push(`ילדים (${children.length}): ${children.map(c => c.fullName).join(', ')}`);
      if (person.relationToYael) parts.push(`קשר לשורש: ${person.relationToYael}`);
      if (person.note_plain) parts.push(person.note_plain.slice(0, 300));
      return { answer: parts.join('\n'), personId: person.id };
    }
  }

  // ── countries / birthplaces ────────────────────────────────────────────────
  if (/אילו\s+מדינות|כמה\s+מדינות|which\s+countries|how\s+many\s+countries|מאיפה|from\s+where/.test(q)) {
    const countryCount = new Map();
    for (const p of persons) {
      if (!p.birthPlace) continue;
      const parts = p.birthPlace.split(',');
      const country = parts[parts.length - 1].trim();
      countryCount.set(country, (countryCount.get(country) ?? 0) + 1);
    }
    if (countryCount.size > 0) {
      const sorted = [...countryCount.entries()].sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 10).map(([c, n]) => `${c}: ${n} אנשים`);
      return {
        answer: `מקומות לידה בגרף (${countryCount.size} מיקומים שונים):\n${top.join('\n')}` +
          (sorted.length > 10 ? `\n…ועוד ${sorted.length - 10} מיקומים.` : ''),
        personId: null,
      };
    }
  }

  return null;
}

// ── keyword search (fallback) ─────────────────────────────────────────────────

function keywordSearch(query, persons) {
  const tokens = extractNameTokens(query).filter(w => w.length > 2);
  if (!tokens.length) return null;

  const hits = persons.filter(p => {
    const blob = [
      p.fullName, p.hebrewName, p.birthName,
      p.birthPlace, p.note_plain, p.story, p.relationToYael,
    ].filter(Boolean).join(' ').toLowerCase();

    return tokens.some(word => {
      if (blob.includes(word)) return true;
      return phoneticMatchHE(word, blob);
    });
  });

  if (!hits.length) return null;

  if (hits.length <= 2) {
    return hits.map(p => {
      const parts = [`**${p.fullName}**`];
      if (p.hebrewName) parts.push(`(${p.hebrewName})`);
      if (p.birthDate || p.birthPlace) {
        parts.push(`נולד/ה: ${[p.birthDate, p.birthPlace].filter(Boolean).join(', ')}`);
      }
      if (p.deathDate) parts.push(`נפטר/ה: ${p.deathDate}`);
      if (p.relationToYael) parts.push(`קשר לשורש: ${p.relationToYael}`);
      return parts.join('\n');
    }).join('\n\n');
  }

  const lines = hits.slice(0, 5).map(p => {
    const parts = [p.fullName];
    if (p.birthDate) parts.push(`נולד/ה ${p.birthDate}`);
    if (p.birthPlace) parts.push(`ב${p.birthPlace}`);
    if (p.deathDate) parts.push(`נפטר/ה ${p.deathDate}`);
    if (p.relationToYael) parts.push(`(${p.relationToYael})`);
    return parts.join(', ');
  });
  const more = hits.length > 5 ? `\n…ועוד ${hits.length - 5} תוצאות.` : '';
  return `נמצאו ${hits.length} תוצאות:\n${lines.join('\n')}${more}`;
}

// ── OpenAI call ───────────────────────────────────────────────────────────────

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

// ── context builder (for OpenAI path) ────────────────────────────────────────

function buildContext(query, persons, families, dnaMatches) {
  const q = query.toLowerCase();
  const nameTokens = extractNameTokens(query);
  const personMap = new Map(persons.map(p => [p.id, p]));
  const familyMap = new Map(families.map(f => [f.id, f]));

  // Relevant persons (keyword + phonetic)
  const relevant = persons.filter(p => {
    const blob = [p.fullName, p.hebrewName, p.birthName, p.birthPlace, p.note_plain]
      .filter(Boolean).join(' ').toLowerCase();
    return nameTokens.some(w => blob.includes(w) || phoneticMatchHE(w, blob));
  }).slice(0, 10);

  const root = persons.find(p => p.id === dnaMatches?.meta?.rootPersonId) ?? persons[0];

  const personLines = [...new Set([root, ...relevant].filter(Boolean))].map(p => {
    // Add family relationships inline
    const spouseFamIds = p.familiesAsSpouse ?? [];
    const children = spouseFamIds
      .flatMap(fid => familyMap.get(fid)?.children ?? [])
      .map(id => personMap.get(id)).filter(Boolean);

    const parentFam = p.familyAsChild ? familyMap.get(p.familyAsChild) : null;
    const parents = (parentFam?.spouses ?? []).map(id => personMap.get(id)).filter(Boolean);

    return [
      `שם: ${p.fullName}`,
      p.hebrewName ? `שם עברי: ${p.hebrewName}` : null,
      p.birthDate ? `לידה: ${p.birthDate}` : null,
      p.birthPlace ? `מקום לידה: ${p.birthPlace}` : null,
      p.deathDate ? `פטירה: ${p.deathDate}` : null,
      parents.length ? `הורים: ${parents.map(x => x.fullName).join(', ')}` : null,
      children.length ? `ילדים (${children.length}): ${children.map(x => x.fullName).join(', ')}` : null,
      p.relationToYael ? `קשר לשורש: ${p.relationToYael}` : null,
      p.note_plain ? `הערות: ${p.note_plain.slice(0, 200)}` : null,
    ].filter(Boolean).join(' | ');
  });

  const statsLine = `סה"כ ${persons.length} אנשים בגרף.`;

  let dnaContext = '';
  if (DNA_KEYWORDS.some(k => q.includes(k.toLowerCase())) && dnaMatches?.matches) {
    const dnaLines = dnaMatches.matches.slice(0, 5).map(m =>
      `${m.name}: ${m.sharedCm} cM, ${m.relationship ?? ''}, ענף: ${m.branch ?? ''}`
    );
    dnaContext = '\nהתאמות DNA:\n' + dnaLines.join('\n');
  }

  return [statsLine, ...personLines].join('\n') + dnaContext;
}

// ── main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  console.log('[chat/query] method:', req.method);
  cors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, message: 'Family chat API is running.' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or empty query field.' });
  }

  try {
    const [graph, dnaData] = await Promise.all([
      loadJson('family-graph.json'),
      loadJson('dna-matches.json').catch(() => null),
    ]);

    const persons = Array.isArray(graph.persons) ? graph.persons : Object.values(graph.persons ?? {});
    const families = Array.isArray(graph.families) ? graph.families : Object.values(graph.families ?? {});

    let answer, source, personId = null;

    if (process.env.OPENAI_API_KEY) {
      const context = buildContext(query.trim(), persons, families, dnaData);
      answer = await openAiAnswer(query.trim(), context);
      source = 'openai';
      personId = findPersonByName(extractNameTokens(query.trim()), persons)?.id ?? null;
    } else {
      // Try structural answer first (uses family graph relationships)
      const structured = structuredAnswer(query.trim(), persons, families);
      if (structured) {
        answer = structured.answer;
        personId = structured.personId;
        source = 'structured';
      } else {
        answer = keywordSearch(query.trim(), persons);
        source = 'keyword';
        personId = findPersonByName(extractNameTokens(query.trim()), persons)?.id ?? null;
      }
    }

    if (!answer) {
      return res.status(200).json({
        ok: true,
        answer: 'לא נמצאה התאמה ברורה בגרף המשפחה. נסה/י לנסח מחדש.',
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
