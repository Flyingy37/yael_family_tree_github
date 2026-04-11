/**
 * FamilyBranchSunburst — adaptive chart of family members by surname branch.
 * Renders a sunburst for smaller surname sets and falls back to a bar chart
 * when the surname distribution gets too dense for radial labeling.
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

type SurnameSlice = {
  name: string;
  count: number;
  total: number;
  percent: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  color: string;
};

// Keep the chart legible by showing only the most common surnames individually.
// The remainder are grouped into a single "Other" slice.
const MAX_VISIBLE_SLICES = 14;

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
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
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
  const [locked, setLocked] = useState<string | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.23;
  const rootR = size * 0.21;

  const slices = useMemo<SurnameSlice[]>(() => {
    const counts = new Map<string, number>();
    for (const person of personList) {
      if (!filteredIds.has(person.id)) continue;
      const raw = (person.surnameFinal || person.surname || '').trim();
      if (!raw || isPlaceholderSurname(raw)) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const visible = sorted.slice(0, MAX_VISIBLE_SLICES);
    const otherCount = sorted.slice(MAX_VISIBLE_SLICES).reduce((s, [, n]) => s + n, 0);
    const total = sorted.reduce((s, [, n]) => s + n, 0);
    const chartSlices: Array<[string, number]> = otherCount > 0
      ? [...visible, [t ? 'אחרים' : 'Other', otherCount]]
      : visible;

    let cursor = -Math.PI / 2;
    return chartSlices.map(([name, count], i) => {
      const sweep = total > 0 ? (count / total) * 2 * Math.PI : 0;
      const midAngle = cursor + sweep / 2;
      const slice: SurnameSlice = {
        name,
        count,
        total,
        percent: total > 0 ? count / total : 0,
        startAngle: cursor,
        endAngle: cursor + sweep,
        midAngle,
        color: PALETTE[i % PALETTE.length],
      };
      cursor += sweep;
      return slice;
    });
  }, [personList, filteredIds, t]);

  const totalShown = filteredIds.size;
  // Switch to a bar view sooner once the distribution becomes crowded.
  const useBars = slices.length > 9;
  const maxBarCount = Math.max(1, ...slices.map((slice) => slice.count));
  const activeSlice = locked ?? hovered;
  const hideArcLabels = size < 320 || slices.length > 8;

  const renderRootSummary = () => (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,247,242,0.95))] px-4 py-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(160,147,125,0.16)] bg-[#eceff3] text-center">
        <div>
          <div className="text-sm font-bold text-[rgb(94,87,78)]">{totalShown.toLocaleString()}</div>
          <div className="text-[10px] text-[rgb(141,134,123)]">{t ? 'אנשים' : 'people'}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[rgb(94,87,78)]">
          {t ? 'התפלגות שמות משפחה' : 'Surname distribution'}
        </div>
        <div className="text-xs leading-5 text-[rgb(126,117,104)]">
          {t
            ? 'השמות השכיחים מוצגים בנפרד. שאר השמות מקובצים תחת “אחרים”.'
            : 'The most common surnames are shown individually. The rest are grouped under “Other”.'}
        </div>
      </div>
    </div>
  );

  const renderBars = () => (
    <div className="w-full max-w-3xl">
      {renderRootSummary()}
      <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
        {slices.map((slice) => {
          const isActive = activeSlice === slice.name;
          const width = Math.max(6, (slice.count / maxBarCount) * 100);
          return (
            <button
              key={slice.name}
              type="button"
              onMouseEnter={() => setHovered(slice.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setLocked((current) => (current === slice.name ? null : slice.name))}
              className={[
                'w-full rounded-2xl border px-3 py-2 text-left transition',
                isActive ? 'shadow-[0_12px_30px_-26px_rgba(79,70,58,0.35)]' : 'hover:shadow-sm',
              ].join(' ')}
              style={{
                backgroundColor: '#ffffff',
                borderColor: isActive ? slice.color : 'rgba(160,147,125,0.16)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[rgb(94,87,78)]">
                  {slice.name}
                </span>
                <span className="text-xs text-[rgb(141,134,123)]">{slice.count}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(240,235,228,0.92)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: slice.color }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (useBars) {
    return renderBars();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {renderRootSummary()}
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
        {slices.map((slice) => {
          const isHovered = hovered === slice.name;
          const labelR = (innerR + outerR) / 2;
          const lx = cx + labelR * Math.cos(slice.midAngle);
          const ly = cy + labelR * Math.sin(slice.midAngle);
          const sliceSweep = slice.endAngle - slice.startAngle;
          const arcLength = Math.max(0, labelR * sliceSweep);
          const showLabel = !hideArcLabels && sliceSweep > 0.22;
          const label =
            slice.name === (t ? 'אחרים' : 'Other')
              ? slice.name
              : slice.percent >= 0.08
                ? slice.name
                : `${Math.round(slice.percent * 100)}%`;
          const labelFontSize =
            slice.name.length > 18
              ? size * 0.021
              : slice.name.length > 12
                ? size * 0.024
                : size * 0.028;

          return (
            <g
              key={slice.name}
              onMouseEnter={() => setHovered(slice.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setLocked((current) => (current === slice.name ? null : slice.name))}
              style={{ cursor: 'pointer' }}
            >
              <path
                d={annularArcPath(cx, cy, innerR, isHovered ? outerR + 8 : outerR, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="white"
                strokeWidth={2}
                opacity={activeSlice && !isHovered ? 0.55 : 1}
                style={{ transition: 'opacity 0.15s, d 0.15s' }}
              />
              {showLabel && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={labelFontSize}
                  fontWeight="600"
                  fill="white"
                  textLength={arcLength > 0 ? arcLength * 0.82 : undefined}
                  lengthAdjust="spacingAndGlyphs"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Separator ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="white" strokeWidth={2} />

        {/* Hover tooltip in center */}
        {hovered && (() => {
          const s = slices.find((slice) => slice.name === hovered);
          if (!s) return null;
          return (
            <>
              <circle
                cx={cx}
                cy={cy}
                r={rootR}
                fill="#f7f8fa"
                stroke="#c7d0d9"
                strokeWidth={1.5}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fontSize={size * 0.034}
                fontWeight="700"
                fill="#4b5563"
                style={{ pointerEvents: 'none' }}
              >
                {s.count.toLocaleString()}
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fontSize={size * 0.026}
                fill="#6b7280"
                style={{ pointerEvents: 'none' }}
              >
                {s.name}
              </text>
            </>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex max-h-40 max-w-sm flex-wrap justify-center gap-x-4 gap-y-1.5 overflow-y-auto text-xs">
        {slices.map((slice) => (
          <button
            key={slice.name}
            className="flex items-center gap-1.5 cursor-pointer"
            type="button"
            onMouseEnter={() => setHovered(slice.name)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setLocked((current) => (current === slice.name ? null : slice.name))}
          >
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
            />
            <span className={`${activeSlice === slice.name ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
              {slice.name}
            </span>
            <span className="text-stone-400">{slice.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
