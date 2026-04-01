/**
 * Vercel Serverless: streaming family Q&A over a compact slice of family-graph.json.
 * Requires AI Gateway (Vercel OIDC on deploy) or AI_GATEWAY_API_KEY / OPENAI_API_KEY for local dev.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText } from 'ai';

type Lang = 'he' | 'en';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GraphPerson {
  id: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  generation: number | null;
  relationToYael: string | null;
  hops: number | null;
  holocaustVictim: boolean;
  tags: string[];
}

interface GraphFamily {
  id: string;
  spouses: string[];
  children: string[];
}

interface FamilyGraphJson {
  persons: GraphPerson[];
  families: GraphFamily[];
  rootPersonId: string;
}

const MAX_PEOPLE = 900;
const MAX_FAMILIES = 450;
const MAX_MESSAGE_CHARS = 4000;
const MAX_MESSAGES = 24;

function baseUrlFromRequest(req: VercelRequest): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost';
  return `${proto}://${host}`;
}

async function loadGraphContext(baseUrl: string): Promise<string> {
  const url = `${baseUrl}/family-graph.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load graph: ${res.status}`);
  }
  const data = (await res.json()) as FamilyGraphJson;
  const sorted = [...data.persons].sort((a, b) => {
    const ha = a.hops ?? 9999;
    const hb = b.hops ?? 9999;
    if (ha !== hb) return ha - hb;
    return a.fullName.localeCompare(b.fullName);
  });
  const slice = sorted.slice(0, MAX_PEOPLE);
  const lines = [
    `rootPersonId: ${data.rootPersonId}`,
    `peopleInContext: ${slice.length} of ${data.persons.length} total`,
    '',
    'TAB-SEPARATED PEOPLE (id, fullName, birthDate, deathDate, birthPlace, generation, relationToYael, holocaustVictim, tags):',
  ];
  for (const p of slice) {
    const tags = (p.tags || []).join(';');
    lines.push(
      [
        p.id,
        p.fullName,
        p.birthDate ?? '',
        p.deathDate ?? '',
        p.birthPlace ?? '',
        p.generation ?? '',
        p.relationToYael ?? '',
        p.holocaustVictim ? 'yes' : '',
        tags,
      ].join('\t')
    );
  }
  lines.push('', `FAMILIES (first ${MAX_FAMILIES}, id: spouses | children):`);
  for (const f of data.families.slice(0, MAX_FAMILIES)) {
    lines.push(`${f.id}: ${f.spouses.join('+')} | ${f.children.join('+')}`);
  }
  return lines.join('\n');
}

function hasAiCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.OPENAI_API_KEY
  );
}

function systemPrompt(lang: Lang, dataContext: string): string {
  const intro =
    lang === 'he'
      ? `את/ה עוזר/ת גנאלוגי/ת לאתר משפחת ליבנת-זיידמן. ענה בעברית.
כללים:
- השתמש/י **רק** בנתוני ההקשר שלמטה (עץ משפחה). אל תמציא/י אנשים, תאריכים או קשרים שלא מופיעים שם.
- אם אין במידע מענה מספקת, אמור/י בבירור שאין בנתונים שבהקשר.
- ציין/י מזהים (id) כשהם עוזרים (למשל @I1@).
- היה/י תמציתי/ת; אפשר רשימות קצרות כשמתאים.`
      : `You are a genealogy assistant for the Livnat–Zaidman family site. Answer in English.
Rules:
- Use **only** the DATA CONTEXT below. Do not invent people, dates, or relationships not present there.
- If the context is insufficient, say so clearly.
- Mention person ids (e.g. @I1@) when helpful.
- Be concise; short lists are fine when appropriate.`;

  return `${intro}

DATA CONTEXT:
${dataContext}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').send('Method Not Allowed');
    return;
  }

  if (!hasAiCredentials()) {
    res.status(503).json({
      error: 'Chat is not configured on the server (missing AI credentials).',
      errorHe: 'הצ׳אט לא הוגדר בשרת — חסרים מפתחות AI (AI Gateway / OIDC).',
    });
    return;
  }

  let body: { messages?: ChatMessage[]; language?: string };
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lang: Lang = body.language === 'en' ? 'en' : 'he';

  const trimmed: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    const c = typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_CHARS) : '';
    if (!c) continue;
    trimmed.push({ role: m.role, content: c });
  }

  if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Last message must be a non-empty user message' });
    return;
  }

  let dataContext: string;
  try {
    dataContext = await loadGraphContext(baseUrlFromRequest(req));
  } catch (e) {
    console.error('[family-chat] graph load', e);
    res.status(502).json({
      error: 'Could not load family graph for this deployment.',
      errorHe: 'לא ניתן לטעון את קובץ עץ המשפחה מהשרת.',
    });
    return;
  }

  try {
    const result = streamText({
      model: 'openai/gpt-4.1-mini',
      system: systemPrompt(lang, dataContext),
      messages: trimmed.map(m => ({ role: m.role, content: m.content })),
      maxOutputTokens: 2048,
    });
    result.pipeTextStreamToResponse(res);
  } catch (e) {
    console.error('[family-chat] streamText', e);
    res.status(500).json({
      error: 'Model request failed.',
      errorHe: 'בקשה למודל נכשלה. נסו שוב מאוחר יותר.',
    });
  }
}
