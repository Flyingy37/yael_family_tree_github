export function RelationshipChip({
  label,
  tone = 'stone',
  variant = 'default',
}: {
  label: string;
  tone?: 'stone' | 'rose' | 'violet' | 'lime';
  variant?: 'default' | 'atlas';
}) {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium';
  const styles = {
    stone: 'bg-stone-100 text-stone-700 border-stone-300',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    lime: 'bg-lime-50 text-lime-700 border-lime-200',
  } as const;

  const atlasStyles = {
    stone: 'bg-[linear-gradient(180deg,rgba(248,245,240,0.92),rgba(240,235,228,0.84))] text-[rgb(95,91,83)] border-[rgba(156,147,134,0.14)]',
    rose: 'bg-[linear-gradient(180deg,rgba(246,236,233,0.9),rgba(241,228,224,0.8))] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.16)]',
    violet: 'bg-[linear-gradient(180deg,rgba(239,235,242,0.9),rgba(231,226,237,0.82))] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.18)]',
    lime: 'bg-[linear-gradient(180deg,rgba(237,242,233,0.92),rgba(229,236,225,0.84))] text-[rgb(91,112,89)] border-[rgba(135,156,132,0.16)]',
  } as const;

  return (
    <span
      className={`${baseClasses} ${variant === 'atlas' ? atlasStyles[tone] : styles[tone]}`}
    >
      {label}
    </span>
  );
}
