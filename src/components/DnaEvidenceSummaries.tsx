import { useState, useEffect } from 'react';
import { Dna, FlaskConical } from 'lucide-react';

interface DnaEvidenceSummary {
  type: string;
  title: string;
  text: string;
  related_names: string[];
  source_platform: string;
  evidence_strength: 'low' | 'medium' | 'high';
  evidence_scope: string;
  privacy_level: string;
}

interface DnaEvidenceSummariesData {
  meta: {
    description: string;
    lastUpdated: string;
  };
  summaries: DnaEvidenceSummary[];
}

const SCOPE_LABELS: Record<string, { he: string; en: string }> = {
  'cross-tree-corroboration': { he: 'אימות בין-עצים', en: 'Cross-Tree Corroboration' },
  'cross-tree-genealogy':     { he: 'גנאלוגיה בין-עצים', en: 'Cross-Tree Genealogy' },
  'direct-paternal-line':     { he: 'קו אב ישיר', en: 'Direct Paternal Line' },
};

const STRENGTH_STYLES: Record<string, { badge: string; label: { he: string; en: string } }> = {
  high:   { badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300', label: { he: 'חזק', en: 'Strong' } },
  medium: { badge: 'bg-amber-100 text-amber-800 border border-amber-300',       label: { he: 'בינוני', en: 'Medium' } },
  low:    { badge: 'bg-slate-100 text-slate-600 border border-slate-300',        label: { he: 'ראשוני', en: 'Low' } },
};

interface Props {
  language?: 'en' | 'he';
}

export function DnaEvidenceSummaries({ language = 'he' }: Props) {
  const isHe = language === 'he';
  const [data, setData] = useState<DnaEvidenceSummariesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/dna-evidence-summaries.json')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
        <Dna size={16} className="animate-pulse" />
        {isHe ? 'טוען סיכומי ראיות...' : 'Loading evidence summaries...'}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div dir={isHe ? 'rtl' : 'ltr'} className="space-y-3">
      {data.summaries.map((summary, idx) => {
        const scopeLabel = SCOPE_LABELS[summary.evidence_scope];
        const strengthStyle = STRENGTH_STYLES[summary.evidence_strength] ?? STRENGTH_STYLES.medium;

        return (
          <div
            key={idx}
            className="rounded-xl border border-violet-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 bg-violet-300" />

            <div className="p-4 space-y-2">
              {/* Title row */}
              <div className="flex items-start gap-2 flex-wrap">
                <FlaskConical size={15} className="text-violet-500 shrink-0 mt-0.5" strokeWidth={1.8} />
                <span className="font-semibold text-sm text-slate-800 leading-snug flex-1">
                  {summary.title}
                </span>
              </div>

              {/* Body text */}
              <p className="text-xs text-slate-600 leading-relaxed">{summary.text}</p>

              {/* Related names */}
              {summary.related_names.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {summary.related_names.map(name => (
                    <span
                      key={name}
                      className="inline-block text-[10px] bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer meta row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                <span className="text-slate-400">{summary.source_platform}</span>
                {scopeLabel && (
                  <span className="text-slate-400">· {isHe ? scopeLabel.he : scopeLabel.en}</span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${strengthStyle.badge}`}
                >
                  {isHe ? strengthStyle.label.he : strengthStyle.label.en}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Footnote */}
      <p className="text-[10px] text-slate-400 text-center pt-1">
        {isHe
          ? `עודכן: ${data.meta.lastUpdated} · ${data.meta.description}`
          : `Updated: ${data.meta.lastUpdated} · ${data.meta.description}`}
      </p>
    </div>
  );
}
