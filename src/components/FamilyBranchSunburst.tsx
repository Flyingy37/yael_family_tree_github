/**
 * FamilyBranchSunburst — interactive sunburst chart of family members by surname branch.
 * Replaces the old RepoLanguageSunburst (which showed code language stats).
 */
import { useMemo, useState } from 'react';
import type { Person } from '../types';
import { isPlaceholderSurname } from '../utils/surname';

interface Props {
  personList: Person[];
  filteredIds: Set<string>;
  language?: 'en' | 'he';
  size?: number;
}

// Top-N surnames get individual slices; the rest are grouped as "Other"
const MAX_SLICES = 100;

// Soft atlas palette aligned with the family branch colors
const PALETTE = [
  '#b7c7d4', '#dfb1ad', '#d9c58d', '#c6bfd8', '#b7cbb2',
  '#d7d9de', '#cab7d6', '#c6ded9', '#d9c9a0', '#d6b8c7',
  '#aebfd0', '#e0bfab', '#d4cb96', '#c8c0dd', '#bfd1bc',
  '#d6d8dd', '#cfbdd7', '#c4e0dc', '#dbd0a8', '#d8c0cd',
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function annularArcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startAngle: number, endAngle: number,
): string {
  const os = polarToCartesian(cx, cy, outerR, startAngle);
  const oe = polarToCartesian(cx, cy, outerR, endAngle);
  const is = polarToCartesian(cx, cy, innerR, startAngle);
  const ie = polarToCartesian(cx, cy, innerR, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ');
}

export function FamilyBranchSunburst({ personList, filteredIds, language = 'he', size = 360 }: Props) {
  const t = language === 'he';
  const [hovered, setHovered] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.23;
  const rootR  = size * 0.21;

  // Build surname → count map from filtered persons
  const slices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const person of personList) {
      if (!filteredIds.has(person.id)) continue;
      const raw = (person.surnameFinal || person.surname || '').trim();
      const label = raw;
      if (!label || isPlaceholderSurname(label)) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    // Sort descending, take top MAX_SLICES (no "Other" bucket)
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, MAX_SLICES);

    const total = top.reduce((s, [, n]) => s + n, 0);
    let cursor = -Math.PI / 2;

    return top.map(([name, count], i) => {
      const sweep = (count / total) * 2 * Math.PI;
      const midAngle = cursor + sweep / 2;
      const slice = { name, count, total, percent: count / total, startAngle: cursor, endAngle: cursor + sweep, midAngle, color: PALETTE[i % PALETTE.length] };
      cursor += sweep;
      return slice;
    });
  }, [personList, filteredIds, t]);

  const totalShown = filteredIds.size;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={t ? 'תרשים ענפי המשפחה' : 'Family branch sunburst'}
        role="img"
      >
        {/* Root circle */}
        <circle cx={cx} cy={cy} r={rootR} fill="#eceff3" stroke="#c7d0d9" strokeWidth={1.5} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={size * 0.052} fontWeight="700" fill="#4b5563">
          {totalShown.toLocaleString()}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize={size * 0.028} fill="#6b7280">
          {t ? 'אנשים' : 'people'}
        </text>

        {/* Arcs */}
        {slices.map(slice => {
          const isHovered = hovered === slice.name;
          const labelR = (innerR + outerR) / 2;
          const lx = cx + labelR * Math.cos(slice.midAngle);
          const ly = cy + labelR * Math.sin(slice.midAngle);
          const sliceSweep = slice.endAngle - slice.startAngle;
          const showLabel = sliceSweep > 0.22; // only label if arc is wide enough

          return (
            <g
              key={slice.name}
              onMouseEnter={() => setHovered(slice.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={annularArcPath(cx, cy, innerR, isHovered ? outerR + 8 : outerR, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="white"
                strokeWidth={2}
                opacity={hovered && !isHovered ? 0.55 : 1}
                style={{ transition: 'opacity 0.15s, d 0.15s' }}
              />
              {showLabel && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={size * 0.028}
                  fontWeight="600"
                  fill="white"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  {slice.percent >= 0.07 ? slice.name : `${Math.round(slice.percent * 100)}%`}
                </text>
              )}
            </g>
          );
        })}

        {/* Separator ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="white" strokeWidth={2} />

        {/* Hover tooltip in center */}
        {hovered && (() => {
          const s = slices.find(sl => sl.name === hovered);
          if (!s) return null;
          return (
            <>
              <circle cx={cx} cy={cy} r={rootR} fill="#f7f8fa" stroke="#c7d0d9" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
              <text x={cx} y={cy - 8} textAnchor="middle" fontSize={size * 0.034} fontWeight="700" fill="#4b5563" style={{ pointerEvents: 'none' }}>
                {s.count.toLocaleString()}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize={size * 0.026} fill="#6b7280" style={{ pointerEvents: 'none' }}>
                {s.name}
              </text>
            </>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs max-w-xs">
        {slices.map(slice => (
          <div
            key={slice.name}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(slice.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className={`${hovered === slice.name ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
              {slice.name}
            </span>
            <span className="text-stone-400">{slice.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
