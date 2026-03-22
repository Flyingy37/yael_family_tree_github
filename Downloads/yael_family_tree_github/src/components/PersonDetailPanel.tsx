import type { Person, Family } from '../types';

interface Props {
  person: Person;
  persons: Map<string, Person>;
  families: Map<string, Family>;
  onNavigate: (personId: string) => void;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1 border-b border-gray-100">
      <span className="text-gray-500 text-sm min-w-[80px]">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PersonLink({ id, persons, onNavigate }: { id: string; persons: Map<string, Person>; onNavigate: (id: string) => void }) {
  const p = persons.get(id);
  if (!p) return <span className="text-gray-400 text-sm">{id}</span>;
  return (
    <button
      className="text-blue-600 hover:text-blue-800 text-sm underline text-right"
      onClick={() => onNavigate(id)}
    >
      {p.fullName}
    </button>
  );
}

export function PersonDetailPanel({ person, persons, families, onNavigate, onClose }: Props) {
  // Find parents
  const parentFamily = person.familyAsChild ? families.get(person.familyAsChild) : null;
  const parents = parentFamily?.spouses || [];

  // Find spouses and children
  const spouseFamilies = person.familiesAsSpouse.map(fid => families.get(fid)).filter(Boolean) as Family[];
  const spouses = new Set<string>();
  const children: string[] = [];
  for (const fam of spouseFamilies) {
    for (const sid of fam.spouses) {
      if (sid !== person.id) spouses.add(sid);
    }
    children.push(...fam.children);
  }

  // Find siblings
  const siblings = parentFamily
    ? parentFamily.children.filter(id => id !== person.id)
    : [];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto p-4 shadow-lg" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{person.fullName}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {person.hebrewName && person.hebrewName !== person.fullName && (
        <div className="text-sm text-gray-600 mb-2">{person.hebrewName}</div>
      )}

      <div className="space-y-0">
        <InfoRow label="קשר ליעל" value={person.relationToYael} />
        <InfoRow label="דור" value={person.generation?.toString()} />
        <InfoRow label="קפיצות" value={person.hops?.toString()} />
        <InfoRow label="מין" value={person.sex === 'M' ? 'זכר' : person.sex === 'F' ? 'נקבה' : 'לא ידוע'} />
        <InfoRow label="תאריך לידה" value={person.birthDate} />
        <InfoRow label="מקום לידה" value={person.birthPlace} />
        {person.deathDate && <InfoRow label="תאריך פטירה" value={person.deathDate} />}
        <InfoRow label="שם לידה" value={person.birthName} />
        <InfoRow label="שם משפחה" value={person.surnameFinal} />
        {person.title && <InfoRow label="תואר" value={person.title} />}
      </div>

      {person.dnaInfo && (
        <div className="mt-4 p-2 bg-purple-50 rounded text-xs">
          <div className="font-bold text-purple-700 mb-1">🧬 מידע גנטי</div>
          <div className="text-purple-600 whitespace-pre-wrap">{person.dnaInfo}</div>
        </div>
      )}

      {parents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">הורים</h3>
          <div className="space-y-1">
            {parents.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {spouses.size > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">בני זוג</h3>
          <div className="space-y-1">
            {Array.from(spouses).map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">ילדים</h3>
          <div className="space-y-1">
            {children.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {siblings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">אחים/אחיות</h3>
          <div className="space-y-1">
            {siblings.map(id => (
              <div key={id}><PersonLink id={id} persons={persons} onNavigate={onNavigate} /></div>
            ))}
          </div>
        </div>
      )}

      {(person.fatherName || person.motherName) && !parents.length && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-1">הורים (מהנתונים)</h3>
          {person.fatherName && <div className="text-sm">אב: {person.fatherName}</div>}
          {person.motherName && <div className="text-sm">אם: {person.motherName}</div>}
        </div>
      )}
    </div>
  );
}
