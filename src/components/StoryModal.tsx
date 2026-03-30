import { useEffect, useRef } from 'react';
import { X, BookOpen } from 'lucide-react';

interface StoryModalProps {
  personName: string;
  story: string;
  /** When set (e.g. from `Person.storyTitle`), shown as the main heading; name moves to a secondary line */
  storyTitle?: string | null;
  onClose: () => void;
  language?: 'en' | 'he';
}

export function StoryModal({ personName, story, storyTitle, onClose, language = 'he' }: StoryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isHe = language === 'he';

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
      aria-modal="true"
      role="dialog"
      aria-label={personName}
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/30"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 bg-amber-50 px-5 py-4">
          <BookOpen size={20} className="shrink-0 text-amber-600" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
              {isHe ? 'סיפור היסטורי' : 'Historical story'}
            </p>
            <h2 className="truncate text-base font-bold text-slate-800">
              {storyTitle?.trim() || personName}
            </h2>
            {storyTitle?.trim() && storyTitle.trim() !== personName.trim() && (
              <p className="truncate text-xs font-medium text-slate-600">{personName}</p>
            )}
          </div>
          <button
            type="button"
            aria-label={isHe ? 'סגור' : 'Close'}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{story}</p>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
          >
            {isHe ? 'סגור' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
