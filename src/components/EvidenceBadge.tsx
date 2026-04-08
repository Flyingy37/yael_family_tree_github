import type { EvidenceType } from '../branches/ginzburgLiandres';

const EVIDENCE_STYLES: Record<EvidenceType, string> = {
  'family-photo': 'bg-sky-50 text-sky-700 border-sky-200',
  testimony: 'bg-rose-50 text-rose-700 border-rose-200',
  document: 'bg-stone-100 text-stone-700 border-stone-300',
  'dna-clue': 'bg-violet-50 text-violet-700 border-violet-200',
  'external-tree-reference': 'bg-amber-50 text-amber-700 border-amber-200',
};

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  'family-photo': 'Family photo',
  testimony: 'Testimony / story',
  document: 'Document',
  'dna-clue': 'DNA clue',
  'external-tree-reference': 'External tree reference',
};

export function EvidenceBadge({
  type,
  variant = 'default',
  language = 'en',
}: {
  type: EvidenceType;
  variant?: 'default' | 'atlas';
  language?: 'en' | 'he';
}) {
  const atlasStyles: Record<EvidenceType, string> = {
    'family-photo': 'bg-[linear-gradient(180deg,rgba(229,238,241,0.86),rgba(218,231,236,0.76))] text-[rgb(70,103,114)] border-[rgba(121,150,158,0.2)]',
    testimony: 'bg-[linear-gradient(180deg,rgba(245,233,230,0.9),rgba(240,223,219,0.8))] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.2)]',
    document: 'bg-[linear-gradient(180deg,rgba(245,242,235,0.96),rgba(238,232,223,0.9))] text-[rgb(101,92,78)] border-[rgba(160,147,125,0.2)]',
    'dna-clue': 'bg-[linear-gradient(180deg,rgba(237,233,241,0.94),rgba(229,224,236,0.86))] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.22)]',
    'external-tree-reference': 'bg-[linear-gradient(180deg,rgba(242,236,225,0.94),rgba(234,227,213,0.88))] text-[rgb(133,109,72)] border-[rgba(179,154,114,0.2)]',
  };

  const atlasLabelsHe: Record<EvidenceType, string> = {
    'family-photo': 'תצלום משפחתי',
    testimony: 'עדות / סיפור',
    document: 'מסמך',
    'dna-clue': 'רמז DNA',
    'external-tree-reference': 'עץ חיצוני / הפניה מחקרית',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        variant === 'atlas' ? atlasStyles[type] : EVIDENCE_STYLES[type]
      }`}
    >
      {variant === 'atlas' && language === 'he' ? atlasLabelsHe[type] : EVIDENCE_LABELS[type]}
    </span>
  );
}
