import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface Person {
  id: string;
  fullName: string;
  givenName: string;
  surname: string;
  surnameFinal: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  relationToYael: string | null;
  title: string | null;
  familiesAsSpouse: string[];
  familyAsChild: string | null;
}

interface Family {
  id: string;
  spouses: string[];
  children: string[];
}

interface Graph {
  persons: Person[];
  families: Family[];
  rootPersonId: string;
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function recommendationFor(person: Person): string {
  const fullName = (person.fullName || '').trim();
  const rel = (person.relationToYael || '').toLowerCase();
  const title = (person.title || '').toLowerCase();

  if (fullName.toLowerCase().includes('unassociated photos')) {
    return 'Move to media-metadata table; exclude from people graph';
  }
  if (!fullName) {
    return 'Needs manual identity resolution (blank name)';
  }
  if (rel.includes('unconnected')) {
    return 'Manual linking required; flagged as unconnected';
  }
  if (title.includes('page of testimony') || rel.includes('shoah') || rel.includes('holocaust')) {
    return 'Potential link from Shoah evidence package; review family context';
  }
  if (rel) {
    return 'Has relation text but no graph path; infer/repair family edges';
  }
  return 'No relation metadata; keep for archival review';
}

function buildBloodAdjacency(
  personIds: Iterable<string>,
  families: Family[]
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const id of personIds) adjacency.set(id, new Set());

  for (const family of families) {
    // Blood edges: parent <-> child.
    for (const parentId of family.spouses) {
      if (!adjacency.has(parentId)) continue;
      for (const childId of family.children) {
        if (!adjacency.has(childId)) continue;
        adjacency.get(parentId)!.add(childId);
        adjacency.get(childId)!.add(parentId);
      }
    }

    // Direct sibling edges.
    const visibleChildren = family.children.filter(id => adjacency.has(id));
    for (let i = 0; i < visibleChildren.length; i += 1) {
      for (let j = i + 1; j < visibleChildren.length; j += 1) {
        const a = visibleChildren[i];
        const b = visibleChildren[j];
        adjacency.get(a)!.add(b);
        adjacency.get(b)!.add(a);
      }
    }
  }

  return adjacency;
}

function main() {
  const graphPath = join(ROOT, 'public/family-graph.json');
  const graph = JSON.parse(readFileSync(graphPath, 'utf-8')) as Graph;

  const persons = new Map(graph.persons.map(p => [p.id, p]));
  const adjacency = buildBloodAdjacency(persons.keys(), graph.families);

  const connected = new Set<string>();
  const queue: string[] = [graph.rootPersonId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (connected.has(current)) continue;
    connected.add(current);
    for (const next of adjacency.get(current) || []) {
      if (!connected.has(next)) queue.push(next);
    }
  }

  const disconnected = graph.persons
    .filter(p => !connected.has(p.id))
    .sort((a, b) => {
      const relA = a.relationToYael ? 0 : 1;
      const relB = b.relationToYael ? 0 : 1;
      if (relA !== relB) return relA - relB;
      return (a.fullName || '').localeCompare(b.fullName || '');
    });

  const header = [
    'id',
    'full_name',
    'sex',
    'birth_date',
    'surname_final',
    'relation_to_yael',
    'title',
    'recommendation',
  ];

  const rows = disconnected.map(p => [
    p.id,
    p.fullName || '',
    p.sex,
    p.birthDate || '',
    p.surnameFinal || p.surname || '',
    p.relationToYael || '',
    p.title || '',
    recommendationFor(p),
  ]);

  const csv = [
    header.map(escapeCsv).join(','),
    ...rows.map(r => r.map(v => escapeCsv(String(v))).join(',')),
  ].join('\n');

  mkdirSync(join(ROOT, 'public'), { recursive: true });
  const outputPath = join(ROOT, 'public/unlinked-people-review.csv');
  writeFileSync(outputPath, csv, 'utf-8');

  console.log(`Disconnected people: ${disconnected.length}`);
  console.log(`Review file: ${outputPath}`);
}

main();
