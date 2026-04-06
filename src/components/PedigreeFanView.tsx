/**
 * PedigreeFanView — MyHeritage-style ancestor fan + Observable-style descendant sunburst.
 *
 * Fan improvements (matching MyHeritage):
 *  • Curved text following the arc path (SVG textPath)
 *  • Country flag emoji on each segment (from birthPlace)
 *  • Solid branch color per generation-0 ancestor (no gradual lightening)
 *  • Slight alpha fade only for very deep generations to maintain readability
 */
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { Person, Family } from '../types';

interface Props {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  rootPersonId: string;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

interface FanNode {
  id: string;
  name: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  birthPlace: string | null;
  generation: number;
  position: number;
  fatherId: string | null;
  motherId: string | null;
}

interface SunDatum {
  id: string;
  name: string;
  sex?: 'M' | 'F' | 'U';
  value?: number;
  children?: SunDatum[];
}

type ChartType = 'fan' | 'sunburst';

const MAX_GENERATIONS = 6;

// 16 vivid branch colours — one per gen-1 ancestor slot (8 paternal + 8 maternal)
const BRANCH_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
  '#319795', '#3182ce', '#805ad5', '#d53f8c',
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
  '#319795', '#3182ce', '#805ad5', '#d53f8c',
];

/** Branch color per position × generation (solid, same hue as gen-1 ancestor) */
function getBranchColor(position: number, generation: number): string {
  if (generation === 0) return '#fefce8';
  const branchCount = Math.pow(2, generation);
  const idx = Math.floor(position * BRANCH_COLORS.length / branchCount);
  return BRANCH_COLORS[idx % BRANCH_COLORS.length];
}

/** Lighten a hex colour toward white. amount 0→1 */
function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

/** Extract a country flag emoji from a birth-place string */
const COUNTRY_FLAGS: Record<string, string> = {
  russia: '🇷🇺', 'russian empire': '🇷🇺', 'soviet union': '🇷🇺',
  ukraine: '🇺🇦', belarus: '🇧🇾', poland: '🇵🇱',
  romania: '🇷🇴', moldova: '🇲🇩', lithuania: '🇱🇹',
  latvia: '🇱🇻', estonia: '🇪🇪', germany: '🇩🇪',
  austria: '🇦🇹', hungary: '🇭🇺', czech: '🇨🇿',
  slovakia: '🇸🇰', france: '🇫🇷', uk: '🇬🇧',
  'united kingdom': '🇬🇧', england: '🇬🇧', usa: '🇺🇸',
  'united states': '🇺🇸', america: '🇺🇸', canada: '🇨🇦',
  argentina: '🇦🇷', brazil: '🇧🇷', israel: '🇮🇱',
  palestine: '🇮🇱', 'ottoman empire': '🏳️',
};

function getFlag(birthPlace: string | null): string {
  if (!birthPlace) return '';
  const lower = birthPlace.toLowerCase();
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PedigreeFanView({
  persons,
  families,
  rootPersonId,
  onSelectPerson,
  language = 'he',
}: Props) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [centerId,    setCenterId]    = useState(rootPersonId);
  const [generations, setGenerations] = useState(5);
  const [hoveredId,   setHoveredId]   = useState<string | null>(null);
  const [chartType,   setChartType]   = useState<ChartType>('fan');

  const t = language === 'he';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getParents(pid: string) {
    const p = persons.get(pid);
    if (!p?.familyAsChild) return { fatherId: null, motherId: null };
    const fam = families.get(p.familyAsChild);
    if (!fam) return { fatherId: null, motherId: null };
    const father = fam.spouses.find(id => persons.get(id)?.sex === 'M') ?? null;
    const mother = fam.spouses.find(id => persons.get(id)?.sex === 'F') ?? null;
    return { fatherId: father, motherId: mother };
  }

  function getChildIds(pid: string): string[] {
    const out: string[] = [];
    for (const fam of families.values()) {
      if (fam.spouses.includes(pid)) out.push(...fam.children);
    }
    return [...new Set(out)].filter(id => persons.has(id));
  }

  // ── Ancestor nodes (BFS) ────────────────────────────────────────────────────

  const nodes = useMemo<FanNode[]>(() => {
    const result: FanNode[] = [];
    let cur: { id: string; pos: number }[] = [{ id: centerId, pos: 0 }];
    for (let gen = 0; gen <= Math.min(generations, MAX_GENERATIONS); gen++) {
      const next: { id: string; pos: number }[] = [];
      for (const { id, pos } of cur) {
        const p = persons.get(id);
        if (!p) continue;
        const { fatherId, motherId } = getParents(id);
        result.push({ id, name: p.fullName, sex: p.sex, birthDate: p.birthDate,
          birthPlace: p.birthPlace, generation: gen, position: pos, fatherId, motherId });
        if (gen < generations) {
          if (fatherId) next.push({ id: fatherId, pos: pos * 2 });
          if (motherId) next.push({ id: motherId, pos: pos * 2 + 1 });
        }
      }
      cur = next;
    }
    return result;
  }, [centerId, persons, families, generations]);

  // ── Descendant hierarchy (sunburst) ─────────────────────────────────────────

  const sunData = useMemo<SunDatum | null>(() => {
    if (chartType !== 'sunburst') return null;
    function build(id: string, depth: number, visited: Set<string>): SunDatum {
      const p = persons.get(id);
      if (!p || visited.has(id)) return { id, name: p?.fullName ?? id, value: 1 };
      const v2 = new Set(visited); v2.add(id);
      if (depth <= 0) return { id, name: p.fullName, sex: p.sex, value: 1 };
      const kids = getChildIds(id);
      if (!kids.length) return { id, name: p.fullName, sex: p.sex, value: 1 };
      return { id, name: p.fullName, sex: p.sex, children: kids.map(k => build(k, depth - 1, v2)) };
    }
    return build(centerId, generations, new Set());
  }, [centerId, persons, families, generations, chartType]);

  // ── Draw ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (chartType === 'fan') drawFan();
    else drawSunburst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, centerId, hoveredId, persons, onSelectPerson, generations, chartType, sunData]);

  // ── Fan chart ──────────────────────────────────────────────────────────────

  function drawFan() {
    const el  = svgRef.current!;
    const cw  = containerRef.current!.clientWidth  || 700;
    const ch  = containerRef.current!.clientHeight || 600;
    const size = Math.min(cw, ch);
    const cx = size / 2, cy = size / 2;

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const svg = d3.select(el);
    const defs = svg.append('defs');
    const g = svg.append('g');

    const maxGen    = Math.max(...nodes.map(n => n.generation));
    const innerR    = size * 0.09;
    const ringWidth = (size * 0.44) / Math.max(maxGen, 1);

    const byGen = new Map<number, FanNode[]>();
    for (const n of nodes) {
      if (!byGen.has(n.generation)) byGen.set(n.generation, []);
      byGen.get(n.generation)!.push(n);
    }

    for (const [gen, genNodes] of byGen.entries()) {
      if (gen === 0) continue;

      const outerR    = innerR + gen * ringWidth;
      const innerRing = innerR + (gen - 1) * ringWidth;
      const totalSlots    = Math.pow(2, gen);
      const anglePerSlot  = (2 * Math.PI) / totalSlots;
      const startAngle    = -Math.PI / 2;

      for (const node of genNodes) {
        const slotStart = startAngle + node.position * anglePerSlot;
        const slotEnd   = slotStart + anglePerSlot;
        const midAngle  = (slotStart + slotEnd) / 2;

        // Solid branch colour, very subtle lighten for deep gens
        const baseColor = getBranchColor(node.position, gen);
        const fillColor = gen <= 3 ? baseColor : lightenHex(baseColor, (gen - 3) * 0.12);
        const isHov = node.id === hoveredId;

        const arcGen = d3.arc<void>()
          .innerRadius(innerRing + 1.5)
          .outerRadius(isHov ? outerR + 5 : outerR - 0.5)
          .startAngle(slotStart + 0.01)
          .endAngle(slotEnd - 0.01)
          .padAngle(0.012)
          .cornerRadius(2);

        const seg = g.append('g').style('cursor', 'pointer');

        seg.append('path')
          .attr('transform', `translate(${cx},${cy})`)
          .attr('d', arcGen(undefined as unknown as void) ?? '')
          .attr('fill', fillColor)
          .attr('stroke', 'white')
          .attr('stroke-width', isHov ? 2 : 1)
          .style('filter', isHov ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' : 'none')
          .on('mouseenter', () => setHoveredId(node.id))
          .on('mouseleave', () => setHoveredId(null))
          .on('click',      () => { setCenterId(node.id); onSelectPerson(node.id); });

        // ── Curved text path along arc midline ─────────────────────────────
        const arcWidthPx  = anglePerSlot * ((innerRing + outerR) / 2);
        const ringWidthPx = outerR - innerRing;

        if (arcWidthPx > 18 && ringWidthPx > 10) {
          const arcR     = (innerRing + outerR) / 2;
          const pathId   = `arc-${node.id}-${gen}`;

          // For the left half, sweep the path clockwise so text reads left→right
          const textStart = slotStart + 0.02;
          const textEnd   = slotEnd   - 0.02;
          const isLeft    = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI / 2);

          // Build an arc path for the text to follow
          const pathD = isLeft
            ? describeArc(cx, cy, arcR, textEnd, textStart)   // reversed for left half
            : describeArc(cx, cy, arcR, textStart, textEnd);

          defs.append('path').attr('id', pathId).attr('d', pathD);

          const fontSize  = Math.max(6.5, Math.min(13, Math.min(arcWidthPx / 5, ringWidthPx * 0.38)));
          const charW     = fontSize * 0.58;
          const maxChars  = Math.max(3, Math.floor(arcWidthPx * 0.88 / charW));
          const displayName = arcWidthPx > 52 ? node.name : node.name.split(' ')[0];
          const label = displayName.length > maxChars
            ? displayName.slice(0, maxChars - 1) + '…'
            : displayName;

          g.append('text')
            .attr('pointer-events', 'none')
            .style('text-shadow', '0 1px 2px rgba(255,255,255,0.85)')
            .append('textPath')
              .attr('href', `#${pathId}`)
              .attr('startOffset', '50%')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', `${fontSize}px`)
              .attr('font-weight', gen <= 2 ? '700' : '500')
              .attr('fill', gen <= 3 ? '#fff' : '#1c1917')
              .text(label);

          // Birth year below name (only when ring is tall enough)
          if (ringWidthPx > fontSize * 2.6 && node.birthDate && arcWidthPx > 45) {
            const year    = node.birthDate.match(/\d{4}/)?.[0] ?? '';
            const pathId2 = `arc2-${node.id}-${gen}`;
            const arcR2   = arcR + fontSize * 1.1;
            const pathD2  = isLeft
              ? describeArc(cx, cy, arcR2, textEnd, textStart)
              : describeArc(cx, cy, arcR2, textStart, textEnd);
            defs.append('path').attr('id', pathId2).attr('d', pathD2);

            g.append('text')
              .attr('pointer-events', 'none')
              .append('textPath')
                .attr('href', `#${pathId2}`)
                .attr('startOffset', '50%')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', `${Math.max(5.5, fontSize * 0.78)}px`)
                .attr('font-weight', '400')
                .attr('fill', gen <= 3 ? 'rgba(255,255,255,0.85)' : '#6b7280')
                .text(year);
          }
        }

        // ── Country flag dot ───────────────────────────────────────────────
        const flag = getFlag(node.birthPlace);
        if (flag && ringWidthPx > 14) {
          const flagR = Math.max(8, Math.min(14, ringWidthPx * 0.38));
          const dotX  = cx + (outerR - flagR - 2) * Math.cos(midAngle);
          const dotY  = cy + (outerR - flagR - 2) * Math.sin(midAngle);
          g.append('circle')
            .attr('cx', dotX).attr('cy', dotY).attr('r', flagR)
            .attr('fill', 'white').attr('opacity', 0.92)
            .style('pointer-events', 'none');
          g.append('text')
            .attr('x', dotX).attr('y', dotY)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('font-size', `${flagR * 1.3}px`)
            .style('pointer-events', 'none')
            .text(flag);
        }
      }
    }

    // ── Center circle ──────────────────────────────────────────────────────
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', innerR - 2)
      .attr('fill', '#fefce8').attr('stroke', '#fbbf24').attr('stroke-width', 2.5)
      .style('cursor', 'pointer')
      .on('click', () => onSelectPerson(centerId));

    const center = persons.get(centerId);
    if (center) {
      const fs = Math.max(9, innerR * 0.28);
      g.append('text')
        .attr('x', cx).attr('y', cy - fs * 0.6)
        .attr('text-anchor', 'middle').attr('font-size', `${fs}px`)
        .attr('font-weight', '800').attr('fill', '#92400e')
        .text(center.fullName.split(' ')[0]);
      const surname = center.fullName.split(' ').slice(1).join(' ');
      if (surname) {
        g.append('text')
          .attr('x', cx).attr('y', cy + fs * 0.85)
          .attr('text-anchor', 'middle').attr('font-size', `${Math.max(7, fs * 0.72)}px`)
          .attr('fill', '#a16207').text(surname);
      }
    }

    // Guide rings
    for (let gen = 1; gen <= maxGen; gen++) {
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', innerR + gen * ringWidth)
        .attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.4)').attr('stroke-width', 1)
        .style('pointer-events', 'none');
    }
  }

  // ── Sunburst ───────────────────────────────────────────────────────────────

  function drawSunburst() {
    if (!sunData) return;
    const el   = svgRef.current!;
    const cw   = containerRef.current!.clientWidth  || 700;
    const ch   = containerRef.current!.clientHeight || 600;
    const size = Math.min(cw, ch);
    const radius = size / 2 / (generations + 1);

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hierarchy = d3.hierarchy<SunDatum>(sunData as any)
      .sum((d: SunDatum) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partition = d3.partition<SunDatum>().size([2 * Math.PI, hierarchy.height + 1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root: any = partition(hierarchy as any);

    const topCount = (sunData.children?.length ?? 1) + 1;
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, topCount));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arc = d3.arc<any>()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: any) => d.y0 * radius)
      .outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.select(el);
    const g   = svg.append('g');

    function arcVisible(d: any) { return d.y1 <= generations + 1 && d.y0 >= 1 && d.x1 > d.x0; }
    function labelVisible(d: any) { return d.y1 <= generations + 1 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.025; }
    function labelTransform(d: any) {
      const x = ((d.x0 + d.x1) / 2) * 180 / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    g.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d: any) => {
        let n = d; while (n.depth > 1) n = n.parent;
        return color(n.data.name);
      })
      .attr('fill-opacity', (d: any) => arcVisible(d) ? (d.children ? 0.68 : 0.45) : 0)
      .attr('pointer-events', (d: any) => arcVisible(d) ? 'auto' : 'none')
      .attr('d', arc)
      .attr('stroke', 'white').attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('click', (_: unknown, d: any) => { setCenterId(d.data.id); onSelectPerson(d.data.id); })
      .on('mouseenter', (_: unknown, d: any) => setHoveredId(d.data.id))
      .on('mouseleave', () => setHoveredId(null))
      .append('title')
      .text((d: any) => d.ancestors().map((a: any) => a.data.name).reverse().join(' › '));

    g.append('g')
      .attr('pointer-events', 'none').attr('text-anchor', 'middle').style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em').attr('font-size', '9px').attr('fill', '#1c1917')
      .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
      .attr('fill-opacity', (d: any) => +labelVisible(d))
      .attr('transform', (d: any) => labelTransform(d))
      .text((d: any) => d.data.name.split(' ')[0]);

    g.append('circle')
      .attr('r', radius).attr('fill', '#fefce8').attr('stroke', '#fbbf24').attr('stroke-width', 2)
      .style('cursor', 'pointer').on('click', () => onSelectPerson(centerId));

    const center = persons.get(centerId);
    if (center) {
      const fs = Math.max(9, radius * 0.3);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.4em')
        .attr('font-size', `${fs}px`).attr('font-weight', '700').attr('fill', '#92400e')
        .text(center.fullName.split(' ')[0]);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '1em')
        .attr('font-size', `${Math.max(7, fs * 0.7)}px`).attr('fill', '#a16207')
        .text(`${root.descendants().length - 1} ${t ? 'אנשים' : 'people'}`);
    }
  }

  const handleBack = useCallback(() => {
    if (centerId !== rootPersonId) { setCenterId(rootPersonId); onSelectPerson(rootPersonId); }
  }, [centerId, rootPersonId, onSelectPerson]);

  const hoveredPerson = hoveredId ? persons.get(hoveredId) : null;

  return (
    <div
      className="flex-1 min-h-0 w-full flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }}
      dir={t ? 'rtl' : 'ltr'}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/80 backdrop-blur border-b border-stone-700 flex-shrink-0 flex-wrap">

        {/* Chart type */}
        <div className="flex items-center rounded-lg bg-stone-800 p-0.5 gap-0.5">
          {([
            { id: 'fan',      icon: '🌀', labelHe: 'אבות',   labelEn: 'Ancestors'   },
            { id: 'sunburst', icon: '☀️', labelHe: 'צאצאים', labelEn: 'Descendants' },
          ] as { id: ChartType; icon: string; labelHe: string; labelEn: string }[]).map(ct => (
            <button
              key={ct.id}
              onClick={() => setChartType(ct.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                chartType === ct.id
                  ? 'bg-amber-500 text-stone-900 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {ct.icon} {t ? ct.labelHe : ct.labelEn}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-stone-700" />

        <div>
          <h2 className="text-xs font-bold text-stone-200 leading-tight">
            {chartType === 'fan'
              ? (t ? 'תרשים אבות' : 'Ancestor Fan')
              : (t ? 'תרשים צאצאים' : 'Descendant Sunburst')}
          </h2>
          <p className="text-[10px] text-stone-500">
            {t ? 'לחצי לריכוז על אדם' : 'Click to centre'}
          </p>
        </div>

        <div className="flex items-center gap-2 ms-auto flex-wrap">
          {/* Generations */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-stone-500">{t ? 'דורות:' : 'Gens:'}</span>
            {[3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => setGenerations(g)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  generations === g
                    ? 'bg-amber-500 text-stone-900 shadow'
                    : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {centerId !== rootPersonId && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                         bg-stone-800 text-amber-400 hover:bg-stone-700
                         rounded-full transition-all border border-stone-700"
            >
              ← {t ? 'חזרה' : 'Back'}
            </button>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredPerson && (
        <div className="flex-shrink-0 mx-4 mt-1.5 px-4 py-1.5 bg-stone-800/95 backdrop-blur text-white rounded-xl text-sm shadow-xl flex items-center gap-3 border border-stone-700">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            hoveredPerson.sex === 'F' ? 'bg-pink-400' : hoveredPerson.sex === 'M' ? 'bg-blue-400' : 'bg-stone-500'
          }`} />
          <span className="font-semibold">{hoveredPerson.fullName}</span>
          {hoveredPerson.birthDate && <span className="text-stone-400 text-xs">{hoveredPerson.birthDate}</span>}
          {hoveredPerson.birthPlace && (
            <span className="text-stone-500 text-xs">
              {getFlag(hoveredPerson.birthPlace)} {hoveredPerson.birthPlace}
            </span>
          )}
          <span className="ms-auto text-[10px] text-stone-500">
            {t ? 'לחץ לריכוז' : 'Click to centre'}
          </span>
        </div>
      )}

      {/* SVG */}
      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center p-2">
        <svg ref={svgRef} className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-1.5 border-t border-stone-800 bg-stone-900/70 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />{t ? 'גבר' : 'Male'}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />{t ? 'אישה' : 'Female'}</span>
        <span className="text-stone-700">·</span>
        <span>{nodes.length} {t ? 'אנשים' : 'people'}</span>
      </div>
    </div>
  );
}

// ── SVG arc path helper (for textPath) ────────────────────────────────────────

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
