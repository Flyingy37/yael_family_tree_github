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
    stone: 'bg-[rgba(241,238,233,0.96)] text-[rgb(95,91,83)] border-[rgba(156,147,134,0.25)]',
    rose: 'bg-[rgba(241,229,226,0.82)] text-[rgb(145,95,90)] border-[rgba(181,138,132,0.25)]',
    violet: 'bg-[rgba(233,229,239,0.85)] text-[rgb(100,87,128)] border-[rgba(139,126,166,0.28)]',
    lime: 'bg-[rgba(231,237,227,0.9)] text-[rgb(91,112,89)] border-[rgba(135,156,132,0.26)]',
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
