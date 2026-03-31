import OpenAI from 'openai';
import Fuse from 'fuse.js';
import type { Person, Family } from '../types';

/** Maximum number of persons to include in the AI context. */
const MAX_CONTEXT_PERSONS = 30;

/**
 * Build a compact text summary of a person for the AI prompt.
 */
function summarisePerson(p: Person): string {
  const parts: string[] = [p.fullName];
  if (p.hebrewName) parts.push(`(${p.hebrewName})`);
  if (p.sex !== 'U') parts.push(p.sex === 'M' ? 'זכר' : 'נקבה');
  if (p.birthDate) parts.push(`נולד/ה: ${p.birthDate}`);
  if (p.deathDate) parts.push(`נפטר/ה: ${p.deathDate}`);
  if (p.birthPlace) parts.push(`מקום לידה: ${p.birthPlace}`);
  if (p.relationToYael) parts.push(`קרבה ליעל: ${p.relationToYael}`);
  if (p.fatherName) parts.push(`אב: ${p.fatherName}`);
  if (p.motherName) parts.push(`אם: ${p.motherName}`);
  if (p.spouseName) parts.push(`בן/ת זוג: ${p.spouseName}`);
  if (p.dnaInfo) parts.push(`DNA: ${p.dnaInfo}`);
  if (p.note_plain) parts.push(`הערה: ${p.note_plain.slice(0, 200)}`);
  return parts.join(' | ');
}

/**
 * Find persons relevant to the user's question using Fuse.js.
 */
function findRelevantPersons(
  question: string,
  persons: Map<string, Person>,
  searchIndex: Fuse<Person>,
): Person[] {
  if (persons.size === 0) return [];

  const hits = searchIndex.search(question, { limit: MAX_CONTEXT_PERSONS });
  if (hits.length > 0) return hits.map(h => h.item);

  // Fallback: return a sample of persons for general questions
  return Array.from(persons.values()).slice(0, MAX_CONTEXT_PERSONS);
}

/**
 * Build the system prompt that describes the family tree context.
 */
function buildSystemPrompt(
  personList: Person[],
  families: Map<string, Family>,
  relevantPersons: Person[],
): string {
  const total = personList.length;
  const familyCount = families.size;

  const contextLines = relevantPersons.map(summarisePerson).join('\n');

  return `אתה עוזר מומחה לאילן יוחסין של משפחת ליבנת-זיידמן.
עומדות לרשותך רשומות של ${total} אנשים ו-${familyCount} יחידות משפחה.
ענה בעברית בלבד, בצורה קצרה וממוקדת.
אם אין לך מידע מספיק, אמור זאת בכנות.

== רשומות רלוונטיות ==
${contextLines}
`;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Send a question to the OpenAI API with family-tree context built from the graph.
 * Returns the assistant's reply text.
 */
export async function askFamilyQuestion(
  question: string,
  history: ChatMessage[],
  persons: Map<string, Person>,
  families: Map<string, Family>,
  personList: Person[],
  searchIndex: Fuse<Person>,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.');
  }

  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  // NOTE: calling OpenAI directly from the browser exposes the API key in the
  // page bundle. For a private family app this is acceptable; for a public
  // deployment consider routing requests through a server-side proxy instead.

  const relevantPersons = findRelevantPersons(question, persons, searchIndex);
  const systemPrompt = buildSystemPrompt(personList, families, relevantPersons);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  const completion = await client.chat.completions.create(
    {
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.3,
    },
    { signal },
  );

  return completion.choices[0]?.message?.content?.trim() ?? '';
}
