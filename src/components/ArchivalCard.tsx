import type { ReactNode } from 'react';

export function ArchivalCard({
  title,
  eyebrow,
  children,
  variant = 'default',
  className = '',
}: {
  title: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'atlas';
  className?: string;
}) {
  const cardClass =
    variant === 'atlas'
      ? 'atlas-card rounded-[1.35rem] p-5'
      : 'rounded-2xl border border-stone-200 bg-stone-50/80 p-4 shadow-sm';

  return (
    <div className={`${cardClass} ${className}`.trim()}>
      {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
      <h4 className={`mb-2 text-sm font-semibold ${variant === 'atlas' ? 'text-stone-800 tracking-[0.01em]' : 'text-stone-800'}`}>{title}</h4>
      <div className="text-sm leading-6 text-stone-600">{children}</div>
    </div>
  );
}
