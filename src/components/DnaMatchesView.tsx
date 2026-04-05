import { useState, useEffect } from 'react';
import { Dna, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface DnaMatch {
  name: string;
  relationship: string;
  sharedCm: number;
  longestBlock: number;
  surnames: string | null;
  yDna: string | null;
  mtDna: string | null;
  xMatch: string | null;
  treePersonId: string | null;
  branch: string | null;
  notes: string | null;
}

interface DnaMatchesData {
  meta: {
    tester: string;
    kit: string;
    platform: string;
    totalMatches: number;
    extractedMatches: number;
    minSharedCm: number;
    lastUpdated: string;
    notes: string;
  };
  matches: DnaMatch[];
}

const BRANCH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Alperovich:         { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  Kostrell:           { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  Ginzburg:           { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  'Alperovich-Herbert': { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  'Alperovich-Dubrow':  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  Dascalu:            { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  'Kastrel?':         { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  'Dascalu?':         { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  Unknown:            { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
};

function cmToColor(cm: number): string {
  if (cm >= 1700) return 'bg-amber-500';
  if (cm >= 850)  return 'bg-amber-400';
  if (cm >= 200)  return 'bg-sky-400';
  if (cm >= 90)   return 'bg-emerald-400';
  return 'bg-slate-300';
}

function cmLabel(cm: number, isHe: boolean): string {
  if (cm >= 1700) return isHe ? 'דוד/ה ישיר' : 'Uncle/Aunt';
  if (cm >= 850)  return isHe ? 'בן/בת דוד ראשון' : '1st Cousin';
  if (cm >= 200)  return isHe ? 'בן/בת דוד שני' : '2nd Cousin';
  if (cm >= 90)   return isHe ? 'בן/בת דוד שלישי' : '3rd Cousin';
  return isHe ? 'בן/בת דוד רביעי' : '4th Cousin';
}

interface Props {
  language?: 'en' | 'he';
  onNavigateToPerson?: (personId: string) => void;
}

export function DnaMatchesView({ language = 'he', onNavigateToPerson }: Props) {
  const isHe = language === 'he';
  const [data, setData] = useState<DnaMatchesData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}dna-matches.json`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
        <Dna size={16} className="animate-pulse" />
        {isHe ? 'טוען התאמות DNA...' : 'Loading DNA matches...'}
      </div>
    );
  }
  if (!data) return null;

  const branches = ['all', ...Array.from(new Set(data.matches.map(m => m.branch || 'Unknown')))];
  const filteredMatches = filter === 'all'
    ? data.matches
    : data.matches.filter(m => (m.branch || 'Unknown') === filter);

  return (
    <div dir={isHe ? 'rtl' : 'ltr'} className="space-y-4">
      {/* Header card */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <Dna size={20} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.8} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-800">
              {data.meta.tester} · {data.meta.kit}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">{data.meta.platform}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-emerald-700">
              <span>
                <strong>{data.meta.totalMatches.toLocaleString()}</strong>{' '}
                {isHe ? 'התאמות סה"כ' : 'total matches'}
              </span>
              <span>
                <strong>{data.meta.extractedMatches}</strong>{' '}
                {isHe ? `מוצגות (≥${data.meta.minSharedCm} cM)` : `shown (≥${data.meta.minSharedCm} cM)`}
              </span>
              <span>{isHe ? 'עודכן' : 'Updated'}: {data.meta.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* cM scale legend */}
      <div className="flex flex-wrap gap-2 text-[11px]">
        {[
          { cm: 1700, label: isHe ? '≥1,700 דוד ישיר' : '≥1,700 Uncle/Aunt', cls: 'bg-amber-500 text-white' },
          { cm: 200,  label: isHe ? '200-850 בן דוד שני' : '200–850 2nd Cousin', cls: 'bg-sky-400 text-white' },
          { cm: 90,   label: isHe ? '90-200 בן דוד שלישי' : '90–200 3rd Cousin', cls: 'bg-emerald-400 text-white' },
        ].map(item => (
          <span key={item.cm} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${item.cls}`}>
            {item.label}
          </span>
        ))}
        <span className="text-slate-400 text-[11px] self-center">{isHe ? '· Y-DNA = של המתאים, לא של יעל' : '· Y-DNA = match\'s haplogroup, not Yael\'s'}</span>
      </div>

      {/* Branch filter */}
      <div className="flex flex-wrap gap-1.5">
        {branches.map(b => {
          const colors = BRANCH_COLORS[b] || BRANCH_COLORS['Unknown'];
          const isActive = filter === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => setFilter(b)}
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all"
              style={isActive
                ? { backgroundColor: colors.border, color: '#fff', borderColor: colors.border }
                : { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
              }
            >
              {b === 'all' ? (isHe ? 'הכל' : 'All') : b}
            </button>
          );
        })}
      </div>

      {/* Matches list */}
      <div className="space-y-2">
        {filteredMatches.map((match, idx) => {
          const colors = BRANCH_COLORS[match.branch || 'Unknown'] || BRANCH_COLORS['Unknown'];
          const isOpen = expanded === match.name;
          const barWidth = Math.min(100, (match.sharedCm / 1800) * 100);

          return (
            <div
              key={`${match.name}-${idx}`}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
              style={{ borderColor: colors.border }}
            >
              <button
                type="button"
                className="w-full text-start p-3"
                onClick={() => setExpanded(isOpen ? null : match.name)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800 truncate">{match.name}</span>
                      {match.branch && match.branch !== 'Unknown' && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border"
                          style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                        >
                          {match.branch}
                        </span>
                      )}
                      {match.treePersonId && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                          🌳 {isHe ? 'בעץ' : 'In tree'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{match.relationship}</p>
                  </div>

                  <div className="shrink-0 text-right flex items-center gap-2">
                    <div>
                      <div className={`text-base font-bold tabular-nums ${match.sharedCm >= 1700 ? 'text-amber-600' : match.sharedCm >= 200 ? 'text-sky-700' : 'text-emerald-700'}`}>
                        {match.sharedCm.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">cM</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{cmLabel(match.sharedCm, isHe)}</div>
                    </div>
                    {isOpen ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                  </div>
                </div>

                {/* cM bar */}
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cmToColor(match.sharedCm)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-t px-3 pb-3 pt-2 space-y-1.5 text-xs" style={{ borderColor: colors.border }}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                    <div><span className="text-slate-400">Longest Block:</span> <strong>{match.longestBlock} cM</strong></div>
                    {match.xMatch && <div><span className="text-slate-400">X-Match:</span> <strong className="text-violet-700">{match.xMatch}</strong></div>}
                    {match.yDna && <div><span className="text-slate-400">Y-DNA:</span> <strong className="text-blue-700">{match.yDna}</strong></div>}
                    {match.mtDna && <div><span className="text-slate-400">mtDNA:</span> <strong className="text-rose-700">{match.mtDna}</strong></div>}
                  </div>
                  {match.surnames && (
                    <div className="text-slate-500">
                      <span className="text-slate-400">{isHe ? 'שמות משפחה:' : 'Surnames:'}</span>{' '}
                      <span className="text-slate-700">{match.surnames}</span>
                    </div>
                  )}
                  {match.notes && (
                    <p className="text-slate-700 bg-slate-50 rounded-lg px-2 py-1.5 leading-relaxed">
                      {match.notes}
                    </p>
                  )}
                  {match.treePersonId && onNavigateToPerson && (
                    <button
                      type="button"
                      onClick={() => onNavigateToPerson(match.treePersonId!)}
                      className="inline-flex items-center gap-1 text-emerald-700 underline hover:no-underline text-[11px] mt-1"
                    >
                      <ExternalLink size={10} />
                      {isHe ? 'פתח בעץ' : 'Open in tree'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
