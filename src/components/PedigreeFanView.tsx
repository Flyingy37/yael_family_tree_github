/**
 * PedigreeFanView — ancestor fan chart + Observable-style descendant sunburst.
 *
 * Fan mode  : center = selected person, ancestor rings radiate outward.
 * Sunburst  : Observable-style partition of descendants (rainbow colours).
 *
 * Click any segment to re-centre on that person.
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

// ─── Ancestor fan data ───────────────────────────────────────────────────────

interface FanNode {
  id: string;
  name: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  generation: number;
  position: number;
  fatherId: string | null;
  motherId: string | null;
}

// ─── Sunburst hierarchy data ─────────────────────────────────────────────────

interface SunDatum {
  id: string;
  name: string;
  sex?: 'M' | 'F' | 'U';
  value?: number;
  children?: SunDatum[];
}

// ─── Chart types ─────────────────────────────────────────────────────────────

type ChartType = 'fan' | 'sunburst';

const MAX_GENERATIONS = 6;

// Observable-style vibrant rainbow palette for the fan branches
const BRANCH_COLORS = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#14b8a6', '#3b82f6', '#84cc16', '#ef4444',
  '#8b5cf6', '#f59e0b', '#10b981', '#0ea5e9',
];

function getBranchColor(position: number, generation: number): string {
  if (generation === 0) return '#fef3c7';
  const branchCount = Math.pow(2, generation);
  const idx = Math.floor(position / (branchCount / Math.min(branchCount, BRANCH_COLORS.length)));
  return BRANCH_COLORS[idx % BRANCH_COLORS.length];
}

/** Mix hex colour with white. amount=0 → original, amount=1 → white. */
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PedigreeFanView({
  persons,
  families,
  rootPersonId,
  onSelectPerson,
  language = 'he',
}: Props) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [centerId,   setCenterId]   = useState(rootPersonId);
  const [generations, setGenerations] = useState(5);
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [chartType,  setChartType]  = useState<ChartType>('fan');

  const t = language === 'he';

  // ── helpers ─────────────────────────────────────────────────────────────────

  function getParents(personId: string) {
    const person = persons.get(personId);
    if (!person?.familyAsChild) return { fatherId: null, motherId: null };
    const fam = families.get(person.familyAsChild);
    if (!fam) return { fatherId: null, motherId: null };
    const father = fam.spouses.find(id => persons.get(id)?.sex === 'M') ?? null;
    const mother = fam.spouses.find(id => persons.get(id)?.sex === 'F') ?? null;
    return { fatherId: father, motherId: mother };
  }

  function getChildIds(personId: string): string[] {
    const out: string[] = [];
    for (const fam of families.values()) {
      if (fam.spouses.includes(personId)) out.push(...fam.children);
    }
    return [...new Set(out)].filter(id => persons.has(id));
  }

  // ── Ancestor fan nodes (BFS) ─────────────────────────────────────────────

  const nodes = useMemo<FanNode[]>(() => {
    const result: FanNode[] = [];
    let currentGen: { id: string; pos: number }[] = [{ id: centerId, pos: 0 }];

    for (let gen = 0; gen <= Math.min(generations, MAX_GENERATIONS); gen++) {
      const nextGen: { id: string; pos: number }[] = [];
      for (const { id, pos } of currentGen) {
        const person = persons.get(id);
        if (!person) continue;
        const { fatherId, motherId } = getParents(id);
        result.push({
          id,
          name: person.fullName,
          sex: person.sex,
          birthDate: person.birthDate,
          generation: gen,
          position: pos,
          fatherId,
          motherId,
        });
        if (gen < generations) {
          if (fatherId) nextGen.push({ id: fatherId, pos: pos * 2 });
          if (motherId) nextGen.push({ id: motherId, pos: pos * 2 + 1 });
        }
      }
      currentGen = nextGen;
    }
    return result;
  }, [centerId, persons, families, generations]);

  // ── Descendant hierarchy (for sunburst) ─────────────────────────────────

  const sunData = useMemo<SunDatum | null>(() => {
    if (chartType !== 'sunburst') return null;

    function buildNode(id: string, depth: number, visited: Set<string>): SunDatum {
      const person = persons.get(id);
      if (!person || visited.has(id)) return { id, name: person?.fullName ?? id, value: 1 };
      const newVisited = new Set(visited);
      newVisited.add(id);
      if (depth <= 0) return { id, name: person.fullName, sex: person.sex, value: 1 };
      const kids = getChildIds(id);
      if (kids.length === 0) return { id, name: person.fullName, sex: person.sex, value: 1 };
      return {
        id,
        name: person.fullName,
        sex: person.sex,
        children: kids.map(kid => buildNode(kid, depth - 1, newVisited)),
      };
    }

    return buildNode(centerId, generations, new Set());
  }, [centerId, persons, families, generations, chartType]);

  // ── Draw ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (chartType === 'fan') drawFan();
    else drawSunburst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, centerId, hoveredId, persons, onSelectPerson, generations, chartType, sunData]);

  function drawFan() {
    const el = svgRef.current!;
    const cw  = containerRef.current!.clientWidth  || 700;
    const ch  = containerRef.current!.clientHeight || 600;
    const size = Math.min(cw, ch);
    const cx = size / 2, cy = size / 2;

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const svg = d3.select(el);
    const g   = svg.append('g');

    const maxGen   = Math.max(...nodes.map(n => n.generation));
    const innerR   = size * 0.09;
    const ringWidth = (size * 0.45) / Math.max(maxGen, 1);

    const byGen = new Map<number, FanNode[]>();
    for (const n of nodes) {
      if (!byGen.has(n.generation)) byGen.set(n.generation, []);
      byGen.get(n.generation)!.push(n);
    }

    for (const [gen, genNodes] of byGen.entries()) {
      if (gen === 0) continue;

      const outerR     = innerR + gen * ringWidth;
      const innerRing  = innerR + (gen - 1) * ringWidth;
      const totalSlots = Math.pow(2, gen);
      const anglePerSlot = (2 * Math.PI) / totalSlots;
      const startAngle   = -Math.PI / 2;

      for (const node of genNodes) {
        const slotStart = startAngle + node.position * anglePerSlot;
        const slotEnd   = slotStart + anglePerSlot;
        const midAngle  = (slotStart + slotEnd) / 2;

        // Lighten less (0.04 per gen) to preserve vibrancy
        const baseColor = getBranchColor(node.position, gen);
        const fillColor = lightenColor(baseColor, (gen - 1) * 0.04);
        const isHovered = node.id === hoveredId;

        const arcGen = d3.arc<void>()
          .innerRadius(innerRing + 2)
          .outerRadius(isHovered ? outerR + 4 : outerR - 1)
          .startAngle(slotStart + 0.01)
          .endAngle(slotEnd - 0.01)
          .padAngle(0.015)
          .cornerRadius(2);

        const segGroup = g.append('g').style('cursor', 'pointer');

        segGroup.append('path')
          .attr('transform', `translate(${cx},${cy})`)
          .attr('d', arcGen(undefined as unknown as void) ?? '')
          .attr('fill', fillColor)
          .attr('stroke', 'white')
          .attr('stroke-width', isHovered ? 2 : 1)
          .style('filter', isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : 'none')
          .on('mouseenter', () => setHoveredId(node.id))
          .on('mouseleave', () => setHoveredId(null))
          .on('click',      () => { setCenterId(node.id); onSelectPerson(node.id); });

        // ── Label ──────────────────────────────────────────────────────────
        const arcRadius     = (innerRing + outerR) / 2;
        const arcWidthPx    = anglePerSlot * arcRadius;
        const ringWidthPx   = outerR - innerRing;

        if (arcWidthPx > 14) {
          const lx = cx + arcRadius * Math.cos(midAngle);
          const ly = cy + arcRadius * Math.sin(midAngle);

          // Font size limited by both arc-width and ring-width
          const fontSize = Math.max(6, Math.min(12,
            Math.min(arcWidthPx / 4, ringWidthPx * 0.32)
          ));

          // Radial rotation — flip left-half so text is never upside-down
          const angleDeg   = midAngle * (180 / Math.PI);
          const isFlipZone = angleDeg > 90 && angleDeg < 270;
          const textRot    = isFlipZone ? angleDeg - 90 : angleDeg + 90;

          // How many chars fit in the ring depth
          const charW   = fontSize * 0.62;
          const maxChars = Math.max(2, Math.floor(ringWidthPx * 0.88 / charW));
          const raw      = arcWidthPx > 48 ? node.name : node.name.split(' ')[0];
          const label    = raw.length > maxChars ? raw.slice(0, maxChars - 1) + '…' : raw;

          const labelGroup = g.append('g')
            .attr('transform', `translate(${lx},${ly}) rotate(${textRot})`)
            .style('pointer-events', 'none');

          labelGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', `${fontSize}px`)
            .attr('font-weight', gen <= 2 ? '700' : '400')
            .attr('fill', gen <= 2 ? '#1c1917' : '#374151')
            .style('text-shadow', '0 1px 2px rgba(255,255,255,0.9)')
            .text(label);

          // Birth year below the name (only when ring is tall enough)
          if (ringWidthPx > fontSize * 2.4 && node.birthDate && arcWidthPx > 40) {
            const year = node.birthDate.split(' ').pop() ?? '';
            labelGroup.append('text')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'central')
              .attr('dy', `${fontSize * 1.2}px`)
              .attr('font-size', `${Math.max(5, fontSize * 0.8)}px`)
              .attr('fill', '#6b7280')
              .text(year);
          }
        }

        // Gender dot near outer edge
        const dotR = Math.max(2.5, ringWidth * 0.055);
        const dotX = cx + (outerR - 5) * Math.cos(midAngle);
        const dotY = cy + (outerR - 5) * Math.sin(midAngle);
        g.append('circle')
          .attr('cx', dotX).attr('cy', dotY).attr('r', dotR)
          .attr('fill', node.sex === 'F' ? '#f9a8d4' : node.sex === 'M' ? '#93c5fd' : '#d1d5db')
          .attr('stroke', 'white').attr('stroke-width', 1)
          .style('pointer-events', 'none');
      }
    }

    // ── Center circle ──────────────────────────────────────────────────────
    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', innerR - 2)
      .attr('fill', '#fef9f0').attr('stroke', '#fbbf24').attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', () => onSelectPerson(centerId));

    const center = persons.get(centerId);
    if (center) {
      const fs = Math.max(9, innerR * 0.3);
      g.append('text')
        .attr('x', cx).attr('y', cy - fs * 0.5)
        .attr('text-anchor', 'middle').attr('font-size', `${fs}px`)
        .attr('font-weight', '700').attr('fill', '#92400e')
        .text(center.fullName.split(' ')[0]);

      const surname = center.fullName.split(' ').slice(1).join(' ');
      if (surname) {
        g.append('text')
          .attr('x', cx).attr('y', cy + fs * 0.9)
          .attr('text-anchor', 'middle').attr('font-size', `${Math.max(7, fs * 0.75)}px`)
          .attr('fill', '#a16207').text(surname);
      }
    }

    // ── Guide rings ────────────────────────────────────────────────────────
    for (let gen = 1; gen <= maxGen; gen++) {
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', innerR + gen * ringWidth)
        .attr('fill', 'none').attr('stroke', '#e5e7eb').attr('stroke-width', 0.5)
        .style('pointer-events', 'none');
    }
  }

  function drawSunburst() {
    if (!sunData) return;
    const el  = svgRef.current!;
    const cw  = containerRef.current!.clientWidth  || 700;
    const ch  = containerRef.current!.clientHeight || 600;
    const size = Math.min(cw, ch);

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`);

    const radius = size / 2 / (generations + 1);

    // Build hierarchy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hierarchy = d3.hierarchy<SunDatum>(sunData as any)
      .sum((d: SunDatum) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partition = d3.partition<SunDatum>().size([2 * Math.PI, hierarchy.height + 1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root: any = partition(hierarchy as any);

    // Rainbow colour scale by top-level branch
    const topCount = (sunData.children?.length ?? 1) + 1;
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, topCount));

    // Arc generator
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

    function arcVisible(d: any) {
      return d.y1 <= generations + 1 && d.y0 >= 1 && d.x1 > d.x0;
    }
    function labelVisible(d: any) {
      return d.y1 <= generations + 1 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.025;
    }
    function labelTransform(d: any) {
      const x = ((d.x0 + d.x1) / 2) * 180 / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    // Paths
    g.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d: any) => {
        let node = d;
        while (node.depth > 1) node = node.parent;
        return color(node.data.name);
      })
      .attr('fill-opacity', (d: any) => arcVisible(d) ? (d.children ? 0.65 : 0.42) : 0)
      .attr('pointer-events', (d: any) => arcVisible(d) ? 'auto' : 'none')
      .attr('d', arc)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('click', (_: unknown, d: any) => { setCenterId(d.data.id); onSelectPerson(d.data.id); })
      .on('mouseenter', (_: unknown, d: any) => setHoveredId(d.data.id))
      .on('mouseleave', () => setHoveredId(null))
      .append('title')
      .text((d: any) => d.ancestors().map((a: any) => a.data.name).reverse().join(' › '));

    // Labels
    g.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('fill', '#1c1917')
      .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
      .attr('fill-opacity', (d: any) => +labelVisible(d))
      .attr('transform', (d: any) => labelTransform(d))
      .text((d: any) => d.data.name.split(' ')[0]);

    // Center circle (clickable: go up or show details)
    g.append('circle')
      .attr('r', radius)
      .attr('fill', '#fef9f0')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', () => onSelectPerson(centerId));

    const center = persons.get(centerId);
    if (center) {
      const fs = Math.max(9, radius * 0.3);
      g.append('text')
        .attr('text-anchor', 'middle').attr('dy', '-0.4em')
        .attr('font-size', `${fs}px`).attr('font-weight', '700').attr('fill', '#92400e')
        .text(center.fullName.split(' ')[0]);

      const total = root.descendants().length - 1;
      g.append('text')
        .attr('text-anchor', 'middle').attr('dy', '1em')
        .attr('font-size', `${Math.max(7, fs * 0.7)}px`).attr('fill', '#a16207')
        .text(`${total} ${t ? 'אנשים' : 'people'}`);
    }
  }

  // ── Back to root ─────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (centerId !== rootPersonId) {
      setCenterId(rootPersonId);
      onSelectPerson(rootPersonId);
    }
  }, [centerId, rootPersonId, onSelectPerson]);

  const hoveredPerson = hoveredId ? persons.get(hoveredId) : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 min-h-0 w-full flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #fef3c7 50%, #ede9fe 100%)' }}
      dir={t ? 'rtl' : 'ltr'}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border-b border-stone-200 shadow-sm flex-shrink-0 flex-wrap">

        {/* Chart type selector */}
        <div className="flex items-center rounded-lg bg-stone-100 p-0.5 gap-0.5">
          {([
            { id: 'fan',      icon: '🌀', labelHe: 'אבות',       labelEn: 'Ancestors' },
            { id: 'sunburst', icon: '☀️', labelHe: 'צאצאים',     labelEn: 'Descendants' },
          ] as { id: ChartType; icon: string; labelHe: string; labelEn: string }[]).map(ct => (
            <button
              key={ct.id}
              onClick={() => setChartType(ct.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                chartType === ct.id
                  ? 'bg-white shadow text-stone-900'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {ct.icon} {t ? ct.labelHe : ct.labelEn}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-stone-200" />

        {/* Title */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 leading-tight">
            {chartType === 'fan'
              ? (t ? 'תרשים אבות' : 'Ancestor Fan')
              : (t ? 'תרשים צאצאים' : 'Descendant Sunburst')}
          </h2>
          <p className="text-[10px] text-stone-400">
            {t ? 'לחצי על אדם לריכוז עליו' : 'Click to centre on a person'}
          </p>
        </div>

        <div className="flex items-center gap-2 ms-auto flex-wrap">
          {/* Generations selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-stone-500">{t ? 'דורות:' : 'Gens:'}</span>
            {[3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => setGenerations(g)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  generations === g
                    ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Back button */}
          {centerId !== rootPersonId && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                         bg-violet-100 text-violet-800 hover:bg-violet-200
                         rounded-full transition-all border border-violet-200"
            >
              ← {t ? 'חזרה' : 'Back'}
            </button>
          )}
        </div>
      </div>

      {/* ── Hover tooltip ── */}
      {hoveredPerson && (
        <div className="flex-shrink-0 mx-4 mt-1.5 px-4 py-1.5 bg-stone-800/90 backdrop-blur text-white rounded-xl text-sm shadow-lg flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            hoveredPerson.sex === 'F' ? 'bg-pink-400' : hoveredPerson.sex === 'M' ? 'bg-blue-400' : 'bg-stone-400'
          }`} />
          <span className="font-semibold">{hoveredPerson.fullName}</span>
          {hoveredPerson.birthDate && (
            <span className="text-stone-300 text-xs">נ׳ {hoveredPerson.birthDate}</span>
          )}
          {hoveredPerson.birthPlace && (
            <span className="text-stone-400 text-xs">· {hoveredPerson.birthPlace}</span>
          )}
          <span className="ms-auto text-[10px] text-stone-400">
            {t ? 'לחץ לריכוז' : 'Click to centre'}
          </span>
        </div>
      )}

      {/* ── Chart ── */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center p-2"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* ── Legend ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-1.5 border-t border-stone-100 bg-white/70 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-300" />{t ? 'גבר' : 'Male'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-300" />{t ? 'אישה' : 'Female'}
        </span>
        <span className="text-stone-300">·</span>
        <span>
          {chartType === 'fan'
            ? `${nodes.length} ${t ? 'אנשים' : 'people'}`
            : `${t ? 'לחץ סגמנט לפרטים' : 'Click segment for details'}`}
        </span>
      </div>
    </div>
  );
}
