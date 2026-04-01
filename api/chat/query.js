/**
 * Vercel Serverless Function — /api/chat/query
 *
 * GET  → health check, returns { ok: true }
 * POST → { query: string } → answer about the family tree
 *
 * When OPENAI_API_KEY is set the handler builds a compact context from the
 * family graph JSON and DNA-matches JSON, then calls GPT to answer in Hebrew.
 * Without the key it falls back to a keyword search over the person records.
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

// ── person ID resolver ────────────────────────────────────────────────────────

/**
 * Returns the ID of the single best-matching person for `query`, or null if
 * the query matches zero or more than ~3 persons (too ambiguous to focus).
 */
function findPersonId(query, persons) {
  const q = query.toLowerCase();
  const hits = persons.filter(p => {
    const blob = [p.fullName, p.hebrewName, p.birthName, p.birthPlace]
      .filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).some(word => word.length > 2 && blob.includes(word));
  });
  // Only send a focusable ID when the match is unambiguous (1 hit)
  // or the first hit is clearly the top result (≤3 hits).
  return hits.length > 0 && hits.length <= 3 ? hits[0].id ?? null : null;
}

// ── fallback: keyword search ─────────────────────────────────────────────────

function keywordSearch(query, persons) {
  const q = query.toLowerCase();
  const hits = persons.filter(p => {
    const blob = [
      p.fullName, p.hebrewName, p.birthName,
      p.birthPlace, p.note_plain, p.story,
      p.relationToYael,
    ].filter(Boolean).join(' ').toLowerCase();
    return q.split(/\s+/).some(word => word.length > 2 && blob.includes(word));
  });

  if (!hits.length) return null;

  const lines = hits.slice(0, 5).map(p => {
    const parts = [p.fullName];
    if (p.birthDate) parts.push(`נולד/ה ${p.birthDate}`);
    if (p.birthPlace) parts.push(`ב${p.birthPlace}`);
    if (p.deathDate) parts.push(`נפטר/ה ${p.deathDate}`);
    if (p.relationToYael) parts.push(`(${p.relationToYael})`);
    return parts.join(', ');
  });

  const more = hits.length > 5 ? `\n…ועוד ${hits.length - 5} תוצאות.` : '';
  return lines.join('\n') + more;
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

function buildContext(query, persons, dnaMatches) {
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

  // Add DNA context if query mentions DNA keywords
  let dnaContext = '';
  if (DNA_KEYWORDS.some(k => query.toLowerCase().includes(k.toLowerCase())) && dnaMatches?.matches) {
    const dnaLines = dnaMatches.matches.slice(0, 5).map(m =>
      `${m.name}: ${m.sharedCm} cM, ${m.relationship ?? ''}, ענף: ${m.branch ?? ''}`
    );
    dnaContext = '\nהתאמות DNA:\n' + dnaLines.join('\n');
  }

  return [statsLine, ...personLines].join('\n') + dnaContext;
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

    const persons = Object.values(graph.persons ?? {});

    let answer;
    let source = 'graph';

    if (process.env.OPENAI_API_KEY) {
      const context = buildContext(query.trim(), persons, dnaData);
      answer = await openAiAnswer(query.trim(), context);
      source = 'openai';
    } else {
      answer = keywordSearch(query.trim(), persons);
      source = 'keyword';
    }

    const personId = findPersonId(query.trim(), persons);

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
