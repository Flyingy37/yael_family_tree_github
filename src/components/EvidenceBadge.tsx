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
}: {
  type: EvidenceType;
  variant?: 'default' | 'atlas';
}) {
  const atlasStyles: Record<EvidenceType, string> = {
    'family-photo': 'bg-[rgba(221,235,239,0.75)] text-[rgb(70,103,114)] border-[rgba(121,150,158,0.32)]',
    testimony: 'bg-[rgba(241,229,226,0.8)] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.28)]',
    document: 'bg-[rgba(241,238,231,0.95)] text-[rgb(101,92,78)] border-[rgba(160,147,125,0.28)]',
    'dna-clue': 'bg-[rgba(233,229,239,0.85)] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.3)]',
    'external-tree-reference': 'bg-[rgba(239,234,221,0.9)] text-[rgb(133,109,72)] border-[rgba(179,154,114,0.3)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        variant === 'atlas' ? atlasStyles[type] : EVIDENCE_STYLES[type]
      }`}
    >
      {EVIDENCE_LABELS[type]}
    </span>
  );
}
