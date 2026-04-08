export function RelationshipChip({
  label,
  tone = 'stone',
  variant = 'default',
}: {
  label: string;
  tone?: 'stone' | 'rose' | 'violet' | 'lime';
  variant?: 'default' | 'atlas';
}) {
  const styles = {
    stone: 'bg-stone-100 text-stone-700 border-stone-300',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    lime: 'bg-lime-50 text-lime-700 border-lime-200',
  } as const;

  const atlasStyles = {
    stone: 'bg-[linear-gradient(180deg,rgba(246,243,237,0.98),rgba(239,234,226,0.9))] text-[rgb(95,91,83)] border-[rgba(156,147,134,0.16)]',
    rose: 'bg-[linear-gradient(180deg,rgba(245,233,230,0.92),rgba(240,223,219,0.82))] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.18)]',
    violet: 'bg-[linear-gradient(180deg,rgba(237,233,241,0.94),rgba(229,224,236,0.86))] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.2)]',
    lime: 'bg-[linear-gradient(180deg,rgba(235,240,231,0.95),rgba(227,234,222,0.88))] text-[rgb(91,112,89)] border-[rgba(135,156,132,0.18)]',
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        variant === 'atlas' ? atlasStyles[tone] : styles[tone]
      }`}
    >
      {label}
    </span>
  );
}
