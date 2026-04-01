/**
 * Vercel Serverless Function — /api/chat/query
 *
 * GET  → health check, returns { ok: true }
 * POST → { query: string } → answer about the family tree
 *
 * When OPENAI_API_KEY is set the handler builds a compact context from the
 * family graph JSON and DNA-matches JSON, then calls GPT to answer in Hebrew.
 * Without the key it falls back to smart structured answers + keyword search.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Family names that trigger DNA context in the OpenAI prompt. */
const DNA_KEYWORDS = ['dna', 'DNA', 'קוסטר', 'אלפר', 'גינזבורג'];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/** Load JSON from the public/ directory (shipped with the build). */
async function loadJson(filename) {
  const filePath = join(process.cwd(), 'public', filename);
  const text = await readFile(filePath, 'utf8');
  return JSON.parse(text);
}

// ── family relationship helpers ───────────────────────────────────────────────

/**
 * Build lookup maps from the families array:
 * - childToFamily: personId → family (the family this person is a child in)
 * - personToSpouseFamily: personId → [familyId, ...] (families where person is a spouse)
 */
function buildFamilyMaps(families) {
  const childToFamily = new Map();  // personId → family object
  const personToSpouseFamilies = new Map(); // personId → [family, ...]

  for (const fam of families) {
    if (fam.childIds) {
      for (const cid of fam.childIds) {
        childToFamily.set(cid, fam);
      }
    }
    const spouses = [fam.husbandId, fam.wifeId].filter(Boolean);
    for (const sid of spouses) {
      if (!personToSpouseFamilies.has(sid)) personToSpouseFamilies.set(sid, []);
      personToSpouseFamilies.get(sid).push(fam);
    }
  }

  return { childToFamily, personToSpouseFamilies };
}

/** Find a person by name tokens extracted from the query. */
function findPersonByName(nameTokens, persons) {
  // Score each person by how many tokens match their name fields
  const scored = persons.map(p => {
    const blob = [p.fullName, p.hebrewName, p.givenName, p.surname, p.birthName]
      .filter(Boolean).join(' ').toLowerCase();
    const score = nameTokens.filter(t => t.length > 1 && blob.includes(t)).length;
    return { p, score };
  }).filter(x => x.score > 0);

  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0].p;
}

/** Strip Hebrew prefixes (ל, ב, ה, מ, ו, כ, ש) for matching. */
function stripHebrewPrefix(word) {
  return word.replace(/^[לבהמוכש]/, '');
}

/**
 * Extract likely name tokens from a query.
 * Removes common Hebrew question words and prepositions.
 */
function extractNameTokens(query) {
  const stopWords = new Set([
    'כמה', 'מי', 'מה', 'איפה', 'מאיפה', 'מתי', 'איך', 'כיצד',
    'יש', 'היה', 'היתה', 'יהיה', 'הם', 'הן', 'הוא', 'היא',
    'ילדים', 'ילד', 'ילדה', 'בנים', 'בן', 'בת', 'בנות',
    'הורים', 'אמא', 'אבא', 'אב', 'אם', 'אחים', 'אחות', 'אח',
    'סבא', 'סבתא', 'נכדים', 'נכד', 'נכדה',
    'נשוי', 'נשואה', 'בעל', 'אישה', 'זוג',
    'של', 'על', 'את', 'עם', 'אל', 'מן', 'לפני', 'אחרי',
    'how', 'many', 'who', 'what', 'where', 'when', 'children',
    'parents', 'siblings', 'grandparents', 'the', 'of', 'in', 'is', 'are', 'has', 'have',
  ]);

  return query
    .replace(/[?.,!״"']/g, '')
    .split(/\s+/)
    .map(w => stripHebrewPrefix(w.toLowerCase()))
    .filter(w => w.length > 1 && !stopWords.has(w));
}

// ── smart structured answers ──────────────────────────────────────────────────

/**
 * Detect question intent and return a structured answer if possible.
 * Returns { answer, personId } or null if no structured answer available.
 */
function structuredAnswer(query, persons, families) {
  const q = query.toLowerCase();
  const { childToFamily, personToSpouseFamilies } = buildFamilyMaps(families);
  const personMap = new Map(persons.map(p => [p.id, p]));
  const nameTokens = extractNameTokens(query);

  // ── Total count questions ────────────────────────────────────────────────
  if (/כמה\s+אנש|how\s+many\s+people|total\s+people/.test(q)) {
    return {
      answer: `בעץ המשפחה יש ${persons.length} אנשים.`,
      personId: null,
    };
  }

  // ── Children count / list ────────────────────────────────────────────────
  const childrenQ = /כמה\s+ילד|כמה\s+בנ|מי\s+הילד|מי\s+הבנ|how\s+many\s+child|who\s+are\s+.*child|list.*child/.test(q);
  if (childrenQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const spouseFamilies = personToSpouseFamilies.get(person.id) ?? [];
      const allChildIds = spouseFamilies.flatMap(f => f.childIds ?? []);
      const children = [...new Set(allChildIds)].map(id => personMap.get(id)).filter(Boolean);

      if (children.length === 0) {
        return {
          answer: `ל${person.fullName} אין ילדים רשומים בגרף.`,
          personId: person.id,
        };
      }

      if (/כמה/.test(q) || /how\s+many/.test(q)) {
        // Count question
        const childNames = children.map(c => c.fullName).join(', ');
        return {
          answer: `ל${person.fullName} יש ${children.length} ילדים: ${childNames}.`,
          personId: person.id,
        };
      } else {
        // List question
        const childLines = children.map(c => {
          const parts = [c.fullName];
          if (c.birthDate) parts.push(`(נולד/ה ${c.birthDate})`);
          return parts.join(' ');
        });
        return {
          answer: `ילדי ${person.fullName}:\n${childLines.join('\n')}`,
          personId: person.id,
        };
      }
    }
  }

  // ── Parents ──────────────────────────────────────────────────────────────
  const parentsQ = /מי\s+ה?הורים|מי\s+האבא|מי\s+האמא|מי\s+אב[יה]|מי\s+אמ[אה]|who\s+are.*parents|parent.*of/.test(q);
  if (parentsQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const fam = childToFamily.get(person.id);
      if (!fam) {
        return {
          answer: `לא נמצאו הורים רשומים עבור ${person.fullName}.`,
          personId: person.id,
        };
      }
      const father = fam.husbandId ? personMap.get(fam.husbandId) : null;
      const mother = fam.wifeId ? personMap.get(fam.wifeId) : null;
      const parts = [];
      if (father) parts.push(`אבא: ${father.fullName}`);
      if (mother) parts.push(`אמא: ${mother.fullName}`);
      return {
        answer: `הורי ${person.fullName}:\n${parts.join('\n')}`,
        personId: person.id,
      };
    }
  }

  // ── Siblings ─────────────────────────────────────────────────────────────
  const siblingsQ = /מי\s+האח|כמה\s+אח|who\s+are.*sibling|how\s+many.*sibling/.test(q);
  if (siblingsQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const fam = childToFamily.get(person.id);
      if (!fam || !fam.childIds) {
        return {
          answer: `לא נמצאו אחים/אחיות רשומים עבור ${person.fullName}.`,
          personId: person.id,
        };
      }
      const siblings = fam.childIds
        .filter(id => id !== person.id)
        .map(id => personMap.get(id))
        .filter(Boolean);

      if (siblings.length === 0) {
        return {
          answer: `${person.fullName} הוא/היא ילד/ה יחיד/ה במשפחה.`,
          personId: person.id,
        };
      }

      if (/כמה/.test(q) || /how\s+many/.test(q)) {
        return {
          answer: `ל${person.fullName} יש ${siblings.length} אח/ים-אחות/ות: ${siblings.map(s => s.fullName).join(', ')}.`,
          personId: person.id,
        };
      }
      return {
        answer: `אחים/אחיות של ${person.fullName}:\n${siblings.map(s => s.fullName).join('\n')}`,
        personId: person.id,
      };
    }
  }

  // ── Spouse ───────────────────────────────────────────────────────────────
  const spouseQ = /מי\s+.*בעל|מי\s+.*אישה|מי\s+.*זוג|נשוי|נשואה|who\s+.*spouse|who\s+.*married/.test(q);
  if (spouseQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const spouseFamilies = personToSpouseFamilies.get(person.id) ?? [];
      const spouseIds = spouseFamilies.flatMap(f =>
        [f.husbandId, f.wifeId].filter(id => id && id !== person.id)
      );
      const spouses = [...new Set(spouseIds)].map(id => personMap.get(id)).filter(Boolean);

      if (spouses.length === 0) {
        return {
          answer: `לא נמצא/ה בן/בת זוג רשום/ה עבור ${person.fullName}.`,
          personId: person.id,
        };
      }
      return {
        answer: `בן/בת הזוג של ${person.fullName}: ${spouses.map(s => s.fullName).join(', ')}.`,
        personId: person.id,
      };
    }
  }

  // ── Birth / death info ───────────────────────────────────────────────────
  const birthQ = /מתי\s+נולד|תאריך\s+לידה|when.*born|birth\s+date/.test(q);
  const deathQ = /מתי\s+נפטר|תאריך\s+פטירה|when.*died|death\s+date/.test(q);
  if (birthQ || deathQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const parts = [];
      if (birthQ && person.birthDate) parts.push(`תאריך לידה: ${person.birthDate}`);
      if (birthQ && person.birthPlace) parts.push(`מקום לידה: ${person.birthPlace}`);
      if (deathQ && person.deathDate) parts.push(`תאריך פטירה: ${person.deathDate}`);
      if (deathQ && person.deathPlace) parts.push(`מקום פטירה: ${person.deathPlace}`);
      if (parts.length === 0) {
        const field = birthQ ? 'לידה' : 'פטירה';
        return { answer: `לא נמצאו פרטי ${field} עבור ${person.fullName}.`, personId: person.id };
      }
      return { answer: `${person.fullName}:\n${parts.join('\n')}`, personId: person.id };
    }
  }

  // ── General person lookup ─────────────────────────────────────────────────
  // "מה אתה יודע על X" / "ספר לי על X" / "tell me about X"
  const aboutQ = /ספר|מה\s+אתה\s+יודע|מה\s+ידוע|tell\s+me\s+about|info\s+on|who\s+is/.test(q);
  if (aboutQ) {
    const person = findPersonByName(nameTokens, persons);
    if (person) {
      const parts = [`שם: ${person.fullName}`];
      if (person.hebrewName) parts.push(`שם עברי: ${person.hebrewName}`);
      if (person.birthDate) parts.push(`נולד/ה: ${person.birthDate}`);
      if (person.birthPlace) parts.push(`מקום לידה: ${person.birthPlace}`);
      if (person.deathDate) parts.push(`נפטר/ה: ${person.deathDate}`);
      if (person.relationToYael) parts.push(`קשר לשורש: ${person.relationToYael}`);
      if (person.note_plain) parts.push(`הערות: ${person.note_plain.slice(0, 300)}`);
      return { answer: parts.join('\n'), personId: person.id };
    }
  }

  // ── Countries / birthplaces ───────────────────────────────────────────────
  if (/אילו\s+מדינות|כמה\s+מדינות|which\s+countries|how\s+many\s+countries|מאיפה|from\s+where|origin/.test(q)) {
    const countryCount = new Map();
    for (const p of persons) {
      if (p.birthPlace) {
        // Extract country (last comma-separated part, or full place)
        const parts = p.birthPlace.split(',');
        const country = parts[parts.length - 1].trim();
        countryCount.set(country, (countryCount.get(country) ?? 0) + 1);
      }
    }
    if (countryCount.size > 0) {
      const sorted = [...countryCount.entries()].sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 10).map(([c, n]) => `${c}: ${n} אנשים`);
      return {
        answer: `מקומות לידה בגרף (${countryCount.size} מיקומים שונים):\n${top.join('\n')}${sorted.length > 10 ? `\n…ועוד ${sorted.length - 10} מיקומים.` : ''}`,
        personId: null,
      };
    }
  }

  return null; // No structured answer found
}

// ── fallback: keyword search ─────────────────────────────────────────────────

function keywordSearch(query, persons) {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).map(stripHebrewPrefix).filter(w => w.length > 2);

  const hits = persons.filter(p => {
    const blob = [
      p.fullName, p.hebrewName, p.birthName,
      p.birthPlace, p.note_plain, p.story,
      p.relationToYael,
    ].filter(Boolean).join(' ').toLowerCase();
    return tokens.some(word => blob.includes(word));
  });

  if (!hits.length) return null;

  // If only 1-2 hits, return a proper profile
  if (hits.length <= 2) {
    const lines = hits.map(p => {
      const parts = [`**${p.fullName}**`];
      if (p.hebrewName) parts.push(`(${p.hebrewName})`);
      if (p.birthDate || p.birthPlace) {
        const b = [p.birthDate, p.birthPlace].filter(Boolean).join(', ');
        parts.push(`נולד/ה: ${b}`);
      }
      if (p.deathDate) parts.push(`נפטר/ה: ${p.deathDate}`);
      if (p.relationToYael) parts.push(`קשר לשורש: ${p.relationToYael}`);
      if (p.note_plain) parts.push(p.note_plain.slice(0, 200));
      return parts.join('\n');
    });
    return lines.join('\n\n');
  }

  // Multiple hits — show a compact list
  const lines = hits.slice(0, 5).map(p => {
    const parts = [p.fullName];
    if (p.birthDate) parts.push(`נולד/ה ${p.birthDate}`);
    if (p.birthPlace) parts.push(`ב${p.birthPlace}`);
    if (p.deathDate) parts.push(`נפטר/ה ${p.deathDate}`);
    if (p.relationToYael) parts.push(`(${p.relationToYael})`);
    return parts.join(', ');
  });

  const more = hits.length > 5 ? `\n…ועוד ${hits.length - 5} תוצאות.` : '';
  return `נמצאו ${hits.length} תוצאות:\n` + lines.join('\n') + more;
}

// ── OpenAI call ───────────────────────────────────────────────────────────────

async function openAiAnswer(query, context) {
  const systemPrompt = `אתה עוזר מחקר גנאולוגי למשפחת ליבנת-זיידמן.
ענה בעברית בצורה תמציתית ומדויקת, בהתבסס אך ורק על הנתונים שסופקו.
אם המידע אינו מספיק — אמור "לא נמצא מידע מספיק".
אל תמציא עובדות.`;

  const userMessage = `שאלה: ${query}\n\nנתונים זמינים:\n${context}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 400,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

// ── context builder ───────────────────────────────────────────────────────────

function buildContext(query, persons, families, dnaMatches) {
  const q = query.toLowerCase();

  // Find relevant persons (simple keyword match)
  const relevant = persons.filter(p => {
    const blob = [p.fullName, p.hebrewName, p.birthName, p.birthPlace, p.note_plain]
      .filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).some(w => w.length > 2 && blob.includes(w));
  }).slice(0, 10);

  // Always include root info
  const root = persons.find(p => p.id === dnaMatches?.meta?.rootPersonId) ?? persons[0];

  const personLines = [...new Set([root, ...relevant].filter(Boolean))].map(p =>
    [
      `שם: ${p.fullName}`,
      p.hebrewName ? `שם עברי: ${p.hebrewName}` : null,
      p.birthDate ? `לידה: ${p.birthDate}` : null,
      p.birthPlace ? `מקום לידה: ${p.birthPlace}` : null,
      p.deathDate ? `פטירה: ${p.deathDate}` : null,
      p.relationToYael ? `קשר לשורש: ${p.relationToYael}` : null,
      p.note_plain ? `הערות: ${p.note_plain.slice(0, 200)}` : null,
    ].filter(Boolean).join(', ')
  );

  const statsLine = `סה"כ ${persons.length} אנשים בגרף.`;

  // Build family relationship context for relevant persons
  const { childToFamily, personToSpouseFamilies } = buildFamilyMaps(families);
  const personMap = new Map(persons.map(p => [p.id, p]));
  const familyLines = relevant.slice(0, 5).flatMap(p => {
    const lines = [];
    const parentFam = childToFamily.get(p.id);
    if (parentFam) {
      const father = parentFam.husbandId ? personMap.get(parentFam.husbandId) : null;
      const mother = parentFam.wifeId ? personMap.get(parentFam.wifeId) : null;
      if (father || mother) {
        lines.push(`הורי ${p.fullName}: ${[father?.fullName, mother?.fullName].filter(Boolean).join(', ')}`);
      }
    }
    const spouseFams = personToSpouseFamilies.get(p.id) ?? [];
    const allChildren = spouseFams.flatMap(f => f.childIds ?? []).map(id => personMap.get(id)).filter(Boolean);
    if (allChildren.length) {
      lines.push(`ילדי ${p.fullName} (${allChildren.length}): ${allChildren.map(c => c.fullName).join(', ')}`);
    }
    return lines;
  });

  // Add DNA context if query mentions DNA keywords
  let dnaContext = '';
  if (DNA_KEYWORDS.some(k => query.toLowerCase().includes(k.toLowerCase())) && dnaMatches?.matches) {
    const dnaLines = dnaMatches.matches.slice(0, 5).map(m =>
      `${m.name}: ${m.sharedCm} cM, ${m.relationship ?? ''}, ענף: ${m.branch ?? ''}`
    );
    dnaContext = '\nהתאמות DNA:\n' + dnaLines.join('\n');
  }

  return [statsLine, ...personLines, ...familyLines].join('\n') + dnaContext;
}

// ── person ID resolver ────────────────────────────────────────────────────────

function findPersonId(query, persons) {
  const nameTokens = extractNameTokens(query);
  if (!nameTokens.length) return null;
  const person = findPersonByName(nameTokens, persons);
  return person?.id ?? null;
}

// ── main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  console.log('[chat/query] method:', req.method, 'keys:', Object.keys(req.body ?? {}));
  cors(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Family chat API is running.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing or empty query field.' });
  }

  try {
    const [graph, dnaData] = await Promise.all([
      loadJson('family-graph.json'),
      loadJson('dna-matches.json').catch(() => null),
    ]);

    const persons = Array.isArray(graph.persons)
      ? graph.persons
      : Object.values(graph.persons ?? {});
    const families = Array.isArray(graph.families)
      ? graph.families
      : Object.values(graph.families ?? {});

    let answer;
    let source = 'graph';
    let personId = null;

    if (process.env.OPENAI_API_KEY) {
      const context = buildContext(query.trim(), persons, families, dnaData);
      answer = await openAiAnswer(query.trim(), context);
      source = 'openai';
      personId = findPersonId(query.trim(), persons);
    } else {
      // Try smart structured answer first
      const structured = structuredAnswer(query.trim(), persons, families);
      if (structured) {
        answer = structured.answer;
        personId = structured.personId;
        source = 'structured';
      } else {
        // Fall back to keyword search
        answer = keywordSearch(query.trim(), persons);
        source = 'keyword';
        personId = findPersonId(query.trim(), persons);
      }
    }

    if (!answer) {
      return res.status(200).json({
        ok: true,
        answer: 'לא נמצאה התאמה ברורה בגרף המשפחה. נסה/י לנסח מחדש.',
        source,
        personId: null,
      });
    }

    return res.status(200).json({ ok: true, answer, source, personId });
  } catch (err) {
    console.error('[chat/query]', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
