import { useMemo } from 'react';

interface LanguageEntry {
  name: string;
  percent: number;
}

const REPO_LANGUAGES: LanguageEntry[] = [
  { name: 'TypeScript', percent: 77 },
  { name: 'Python', percent: 18.3 },
  { name: 'JavaScript', percent: 4.5 },
  { name: 'Other', percent: 0.2 },
];

const COLORS: Record<string, string> = {
  TypeScript: '#b7c7d4',
  Python:     '#b7cbb2',
  JavaScript: '#dfb1ad',
  Other:      '#d6d8dd',
};

const ROOT_COLOR = '#eceff3';

interface Arc {
  name: string;
  startAngle: number;
  endAngle: number;
  color: string;
  percent: number;
  /** mid-angle in radians */
  midAngle: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end   = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
  ].join(' ');
}

function annularArcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd   = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const innerEnd   = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc   = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

interface Props {
  language?: 'en' | 'he';
  size?: number;
}

export function RepoLanguageSunburst({ language = 'en', size = 340 }: Props) {
  const t = language === 'he';

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.43;
  const innerR = size * 0.22;
  const rootR  = size * 0.20;

  const total = REPO_LANGUAGES.reduce((s, l) => s + l.percent, 0);

  const arcs = useMemo<Arc[]>(() => {
    let cursor = -Math.PI / 2; // start at top
    return REPO_LANGUAGES.map(lang => {
      const sweep = (lang.percent / total) * 2 * Math.PI;
      const arc: Arc = {
        name: lang.name,
        percent: lang.percent,
        startAngle: cursor,
        endAngle: cursor + sweep,
        midAngle: cursor + sweep / 2,
        color: COLORS[lang.name] ?? '#cccccc',
      };
      cursor += sweep;
      return arc;
    });
  }, [total]);

  const rootLabel = 'yael_family_tree';

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={t ? 'תרשים שפות מאגר' : 'Repository language sunburst chart'}
        role="img"
      >
        {/* Root circle */}
        <circle cx={cx} cy={cy} r={rootR} fill={ROOT_COLOR} />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize={size * 0.033}
          fontWeight="600"
          fill="#4b5563"
        >
          {rootLabel}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize={size * 0.028}
          fill="#6b7280"
        >
          {t ? 'שפות' : 'languages'}
        </text>

        {/* Outer annular arcs */}
        {arcs.map(arc => {
          const labelR = (innerR + outerR) / 2;
          const lx = cx + labelR * Math.cos(arc.midAngle);
          const ly = cy + labelR * Math.sin(arc.midAngle);
          const showLabel = arc.percent >= 2;

          return (
            <g key={arc.name}>
              <path
                d={annularArcPath(cx, cy, innerR, outerR, arc.startAngle, arc.endAngle)}
                fill={arc.color}
                stroke="white"
                strokeWidth={2}
              />
              {showLabel && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={size * 0.032}
                  fontWeight="500"
                  fill="white"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {arc.percent >= 10 ? arc.name : `${arc.percent}%`}
                </text>
              )}
            </g>
          );
        })}

        {/* Thin ring between root and arcs */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="white" strokeWidth={2} />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        {REPO_LANGUAGES.map(lang => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLORS[lang.name] ?? '#ccc' }}
            />
            <span className="text-gray-700">{lang.name}</span>
            <span className="text-gray-400">{lang.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
