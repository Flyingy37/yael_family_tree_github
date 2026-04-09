import type { EvidenceType } from '../branches/ginzburgLiandres';

const EVIDENCE_STYLES: Record<EvidenceType, string> = {
  'family-photo': 'bg-sky-50 text-sky-700 border-sky-200',
  testimony: 'bg-rose-50 text-rose-700 border-rose-200',
  'video-testimony': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  document: 'bg-stone-100 text-stone-700 border-stone-300',
  'dna-clue': 'bg-violet-50 text-violet-700 border-violet-200',
  'external-tree-reference': 'bg-amber-50 text-amber-700 border-amber-200',
};

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  'family-photo': 'Family photo',
  testimony: 'Testimony / story',
  'video-testimony': 'Video testimony',
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
  const baseClasses = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium';
  const atlasStyles: Record<EvidenceType, string> = {
    'family-photo': 'bg-[linear-gradient(180deg,rgba(232,239,242,0.84),rgba(223,233,237,0.74))] text-[rgb(70,103,114)] border-[rgba(121,150,158,0.18)]',
    testimony: 'bg-[linear-gradient(180deg,rgba(247,236,232,0.88),rgba(241,227,223,0.78))] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.18)]',
    'video-testimony': 'bg-[linear-gradient(180deg,rgba(229,240,242,0.9),rgba(220,234,238,0.8))] text-[rgb(58,110,124)] border-[rgba(112,158,171,0.18)]',
    document: 'bg-[linear-gradient(180deg,rgba(246,243,236,0.94),rgba(239,233,224,0.88))] text-[rgb(101,92,78)] border-[rgba(160,147,125,0.18)]',
    'dna-clue': 'bg-[linear-gradient(180deg,rgba(239,235,242,0.92),rgba(231,226,237,0.84))] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.2)]',
    'external-tree-reference': 'bg-[linear-gradient(180deg,rgba(244,238,228,0.92),rgba(236,229,216,0.86))] text-[rgb(133,109,72)] border-[rgba(179,154,114,0.18)]',
  };

  const atlasLabelsHe: Record<EvidenceType, string> = {
    'family-photo': 'תצלום משפחתי',
    testimony: 'עדות / סיפור',
    'video-testimony': 'עדות וידאו',
    document: 'מסמך',
    'dna-clue': 'רמז DNA',
    'external-tree-reference': 'עץ חיצוני / הפניה מחקרית',
  };

  return (
    <span
      className={`${baseClasses} ${variant === 'atlas' ? atlasStyles[type] : EVIDENCE_STYLES[type]}`}
    >
      {variant === 'atlas' && language === 'he' ? atlasLabelsHe[type] : EVIDENCE_LABELS[type]}
    </span>
  );
}
