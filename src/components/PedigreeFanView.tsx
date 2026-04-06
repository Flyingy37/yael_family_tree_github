/**
 * PedigreeFanView — MyHeritage-style ancestor fan + descendant sunburst.
 *
 * Fan design (matching MyHeritage):
 *  • Light/white background with subtle segment fills
 *  • 200° semicircular span opening upward
 *  • Curved text following arc midline (SVG textPath)
 *  • Country flag emoji on each segment
 *  • Colored outer-edge arc borders per top-level branch
 *  • "+" placeholder for unknown/missing ancestors
 *  • Photo in center circle
 *  • Generations selector + person search in toolbar
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
  id: string | null;          // null = unknown/placeholder
  name: string;
  sex: 'M' | 'F' | 'U';
  birthDate: string | null;
  deathDate: string | null;
  birthPlace: string | null;
  photoUrl: string | null;
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

const MAX_GENERATIONS = 7;

// ── Branch colour palette — 8 vivid hues repeated for 16 slots ────────────────
const BRANCH_PALETTE = [
  '#e53e3e', // red
  '#dd6b20', // orange
  '#d69e2e', // yellow-gold
  '#38a169', // green
  '#319795', // teal
  '#3182ce', // blue
  '#805ad5', // purple
  '#d53f8c', // pink
];

/** Return the gen-1 branch index (0-7 for 8 branches, mirrors left/right) */
function branchIdx(position: number, generation: number): number {
  if (generation === 0) return 0;
  const branchCount = Math.pow(2, generation);
  return Math.floor(position * BRANCH_PALETTE.length / branchCount) % BRANCH_PALETTE.length;
}

function branchColor(position: number, generation: number): string {
  if (generation === 0) return '#f9fafb';
  return BRANCH_PALETTE[branchIdx(position, generation)];
}

/** Lighten hex toward white (amount 0–1) */
function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`;
}

// ── Country flag lookup ────────────────────────────────────────────────────────
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
  bulgaria: '🇧🇬', serbia: '🇷🇸', greece: '🇬🇷',
  turkey: '🇹🇷', morocco: '🇲🇦', tunisia: '🇹🇳',
  egypt: '🇪🇬', iraq: '🇮🇶', iran: '🇮🇷',
  spain: '🇪🇸', portugal: '🇵🇹', netherlands: '🇳🇱',
  sweden: '🇸🇪', norway: '🇳🇴', denmark: '🇩🇰',
  switzerland: '🇨🇭',
};

function getFlag(birthPlace: string | null): string {
  if (!birthPlace) return '';
  const lower = birthPlace.toLowerCase();
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return '';
}

// ── Extract year range string ──────────────────────────────────────────────────
function yearRange(birthDate: string | null, deathDate: string | null): string {
  const b = birthDate?.match(/\d{4}/)?.[0] ?? '';
  const d = deathDate?.match(/\d{4}/)?.[0] ?? '';
  if (b && d) return `${b} - ${d}`;
  if (b)      return `Born: ${b}`;
  if (d)      return `Deceased`;
  return '';
}

// ── SVG arc path helper (for textPath) ────────────────────────────────────────
function describeArc(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const [search,      setSearch]      = useState('');
  const [searchOpen,  setSearchOpen]  = useState(false);

  const t = language === 'he';

  // ── Parent lookup ────────────────────────────────────────────────────────────

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

  // ── Build ancestor node tree (BFS) ──────────────────────────────────────────

  const nodes = useMemo<FanNode[]>(() => {
    const result: FanNode[] = [];
    // Each slot: { id | null, pos }
    let cur: { id: string | null; pos: number }[] = [{ id: centerId, pos: 0 }];

    for (let gen = 0; gen <= Math.min(generations, MAX_GENERATIONS); gen++) {
      const next: { id: string | null; pos: number }[] = [];
      for (const { id, pos } of cur) {
        const p = id ? persons.get(id) : undefined;
        const { fatherId, motherId } = id ? getParents(id) : { fatherId: null, motherId: null };

        result.push({
          id,
          name: p?.fullName ?? (t ? 'לא ידוע' : 'Unknown'),
          sex: p?.sex ?? 'U',
          birthDate: p?.birthDate ?? null,
          deathDate: p?.deathDate ?? null,
          birthPlace: p?.birthPlace ?? null,
          photoUrl: p?.photoUrl ?? null,
          generation: gen,
          position: pos,
          fatherId,
          motherId,
        });

        if (gen < generations) {
          next.push(
            { id: fatherId, pos: pos * 2 },
            { id: motherId, pos: pos * 2 + 1 },
          );
        }
      }
      cur = next;
    }
    return result;
  }, [centerId, persons, families, generations, t]);

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

  // ── Search suggestions ────────────────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return [...persons.values()]
      .filter(p => p.fullName.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, persons]);

  // ── Draw ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (chartType === 'fan') drawFan();
    else drawSunburst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, centerId, hoveredId, persons, onSelectPerson, generations, chartType, sunData]);

  // ── Fan chart (MyHeritage style) ──────────────────────────────────────────

  function drawFan() {
    const el  = svgRef.current!;
    const cw  = containerRef.current!.clientWidth  || 720;
    const ch  = containerRef.current!.clientHeight || 580;
    const size = Math.min(cw, ch);
    const cx = size / 2;
    const cy = size * 0.56;   // center sits slightly below midpoint so fan opens upward

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const svg  = d3.select(el);
    const defs = svg.append('defs');
    const bg   = svg.append('g');
    const g    = svg.append('g');
    const top  = svg.append('g');   // on top layer (flags, centre)

    // Background
    bg.append('rect').attr('width', size).attr('height', size).attr('fill', '#f8f7f4');

    const maxGen    = Math.max(...nodes.map(n => n.generation), 1);
    const innerR    = size * 0.095;
    const outerMaxR = size * 0.475;
    const ringWidth = (outerMaxR - innerR) / maxGen;

    // Fan spans 210° centred at the top (opening upward)
    const SPAN = 210 * (Math.PI / 180);
    const startOffset = -Math.PI / 2 - SPAN / 2;  // starts at left

    const byGen = new Map<number, FanNode[]>();
    for (const n of nodes) {
      if (!byGen.has(n.generation)) byGen.set(n.generation, []);
      byGen.get(n.generation)!.push(n);
    }

    for (const [gen, genNodes] of byGen.entries()) {
      if (gen === 0) continue;

      const outerR    = innerR + gen * ringWidth;
      const innerRing = innerR + (gen - 1) * ringWidth;
      const totalSlots   = Math.pow(2, gen);
      const anglePerSlot = SPAN / totalSlots;

      // Sort by position so we draw left→right
      const sorted = [...genNodes].sort((a, b) => a.position - b.position);

      for (const node of sorted) {
        const slotStart = startOffset + node.position * anglePerSlot;
        const slotEnd   = slotStart + anglePerSlot;
        const midAngle  = (slotStart + slotEnd) / 2;

        const base      = branchColor(node.position, gen);
        // Segments get lighter as generations increase (deeper ancestors)
        const lightAmt  = gen <= 2 ? 0.72 : gen <= 4 ? 0.84 : 0.91;
        const fillColor = node.id ? lighten(base, lightAmt) : '#f0f0ee';
        const strokeCol = node.id ? lighten(base, 0.45) : '#d1d5db';
        const isHov     = node.id !== null && node.id === hoveredId;

        const arcGen = d3.arc<void>()
          .innerRadius(innerRing + 1)
          .outerRadius(isHov ? outerR + 4 : outerR - 0.5)
          .startAngle(slotStart + 0.008)
          .endAngle(slotEnd - 0.008)
          .padAngle(0.009)
          .cornerRadius(gen <= 1 ? 3 : 2);

        const seg = g.append('g').style('cursor', node.id ? 'pointer' : 'default');

        seg.append('path')
          .attr('transform', `translate(${cx},${cy})`)
          .attr('d', arcGen(undefined as unknown as void) ?? '')
          .attr('fill', fillColor)
          .attr('stroke', strokeCol)
          .attr('stroke-width', isHov ? 1.5 : 0.8)
          .style('filter', isHov ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))' : 'none')
          .on('mouseenter', () => { if (node.id) setHoveredId(node.id); })
          .on('mouseleave', () => setHoveredId(null))
          .on('click', () => {
            if (node.id) { setCenterId(node.id); onSelectPerson(node.id); }
          });

        // ── Outer coloured border arc ─────────────────────────────────────
        if (gen === 1) {
          const arcBorder = d3.arc<void>()
            .innerRadius(outerR - 3)
            .outerRadius(outerR)
            .startAngle(slotStart + 0.008)
            .endAngle(slotEnd - 0.008)
            .padAngle(0.009);
          g.append('path')
            .attr('transform', `translate(${cx},${cy})`)
            .attr('d', arcBorder(undefined as unknown as void) ?? '')
            .attr('fill', base)
            .style('pointer-events', 'none');
        }

        // ── "+" for unknown ───────────────────────────────────────────────
        if (!node.id) {
          const px = cx + ((innerRing + outerR) / 2) * Math.cos(midAngle);
          const py = cy + ((innerRing + outerR) / 2) * Math.sin(midAngle);
          g.append('text')
            .attr('x', px).attr('y', py)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('font-size', `${Math.min(22, ringWidth * 0.55)}px`)
            .attr('fill', '#9ca3af')
            .style('pointer-events', 'none')
            .text('+');
          continue;
        }

        // ── Curved text (name) ────────────────────────────────────────────
        const arcWidthPx  = anglePerSlot * ((innerRing + outerR) / 2);
        const ringWidthPx = outerR - innerRing;

        if (arcWidthPx > 22 && ringWidthPx > 12) {
          const arcR   = innerRing + ringWidthPx * 0.4;
          const pathId = `arc-${node.id}-${gen}`;

          // Left half (cos < 0) → counter-clockwise arc so text reads left-to-right
          const isLeft = Math.cos(midAngle) < 0;
          const ta = slotStart + 0.015, tb = slotEnd - 0.015;

          // Build arc path: CW for right side, CCW for left side.
          // All segments span < 180° so largeArc is always 0.
          const arcPath = (r: number, reversed: boolean) => {
            const a1 = reversed ? tb : ta;
            const a2 = reversed ? ta : tb;
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
            const sweep = reversed ? 0 : 1;   // CCW for left, CW for right
            return `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2}`;
          };

          defs.append('path').attr('id', pathId).attr('d', arcPath(arcR, isLeft));

          const fontSize = Math.max(7, Math.min(13.5, Math.min(arcWidthPx / 4.5, ringWidthPx * 0.36)));
          const charW    = fontSize * 0.55;
          const maxChars = Math.max(4, Math.floor(arcWidthPx * 0.85 / charW));
          const displayName = arcWidthPx > 60 ? node.name : node.name.split(' ')[0];
          const label = displayName.length > maxChars
            ? displayName.slice(0, maxChars - 1) + '…'
            : displayName;

          g.append('text')
            .attr('pointer-events', 'none')
            .append('textPath')
              .attr('href', `#${pathId}`)
              .attr('startOffset', '50%')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', `${fontSize}px`)
              .attr('font-weight', gen <= 2 ? '700' : '600')
              .attr('fill', '#1c1917')
              .text(label);

          // Year range (second text line)
          if (ringWidthPx > fontSize * 2.8 && arcWidthPx > 40) {
            const yr = yearRange(node.birthDate, node.deathDate);
            if (yr) {
              const arcR2   = innerRing + ringWidthPx * 0.65;
              const pathId2 = `arc2-${node.id}-${gen}`;
              defs.append('path').attr('id', pathId2).attr('d', arcPath(arcR2, isLeft));

              g.append('text')
                .attr('pointer-events', 'none')
                .append('textPath')
                  .attr('href', `#${pathId2}`)
                  .attr('startOffset', '50%')
                  .attr('text-anchor', 'middle')
                  .attr('dominant-baseline', 'middle')
                  .attr('font-size', `${Math.max(5.5, fontSize * 0.75)}px`)
                  .attr('font-weight', '400')
                  .attr('fill', '#6b7280')
                  .text(yr);
            }
          }
        }

        // ── Country flag badge ────────────────────────────────────────────
        const flag = getFlag(node.birthPlace);
        if (flag && ringWidthPx > 16 && anglePerSlot * outerR > 22) {
          const flagR = Math.max(7, Math.min(13, ringWidthPx * 0.32));
          // Place flag near outer edge of segment
          const fR = outerR - flagR - 2;
          const fx = cx + fR * Math.cos(midAngle);
          const fy = cy + fR * Math.sin(midAngle);
          top.append('circle')
            .attr('cx', fx).attr('cy', fy).attr('r', flagR)
            .attr('fill', 'white').attr('opacity', 0.95)
            .attr('stroke', strokeCol).attr('stroke-width', 0.5)
            .style('pointer-events', 'none');
          top.append('text')
            .attr('x', fx).attr('y', fy)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('font-size', `${flagR * 1.35}px`)
            .style('pointer-events', 'none')
            .text(flag);
        }
      }

      // ── Outer guide ring for this generation ─────────────────────────────
      const arcRing = d3.arc<void>()
        .innerRadius(outerR - 0.5)
        .outerRadius(outerR + 0.5)
        .startAngle(startOffset)
        .endAngle(startOffset + SPAN)
        .padAngle(0);
      g.append('path')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('d', arcRing(undefined as unknown as void) ?? '')
        .attr('fill', 'rgba(0,0,0,0.06)')
        .style('pointer-events', 'none');
    }

    // ── Center circle ───────────────────────────────────────────────────────
    const center = persons.get(centerId);

    // Shadow ring
    top.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', innerR + 1)
      .attr('fill', 'none').attr('stroke', '#e5e7eb').attr('stroke-width', 3)
      .style('pointer-events', 'none');

    top.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', innerR)
      .attr('fill', 'white').attr('stroke', '#d1d5db').attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('click', () => onSelectPerson(centerId));

    if (center?.photoUrl) {
      // Clip image to circle
      const clipId = `clip-center-${centerId}`;
      defs.append('clipPath').attr('id', clipId)
        .append('circle').attr('cx', cx).attr('cy', cy).attr('r', innerR - 2);
      top.append('image')
        .attr('href', center.photoUrl)
        .attr('x', cx - (innerR - 2)).attr('y', cy - (innerR - 2))
        .attr('width', (innerR - 2) * 2).attr('height', (innerR - 2) * 2)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .style('pointer-events', 'none');
    }

    // Name text in center (shown even if photo exists, below photo or always)
    if (center) {
      const parts    = center.fullName.split(' ');
      const given    = parts[0];
      const surname  = parts.slice(1).join(' ');
      const hasPhoto = !!center.photoUrl;

      if (!hasPhoto) {
        const fs = Math.max(9, innerR * 0.27);
        // Initials fallback
        const initials = parts.map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
        top.append('text')
          .attr('x', cx).attr('y', cy - fs * 0.5)
          .attr('text-anchor', 'middle').attr('font-size', `${fs * 1.8}px`)
          .attr('font-weight', '800').attr('fill', '#6b7280')
          .style('pointer-events', 'none').text(initials);
      }

      // Name below circle
      const nameY   = cy + innerR + 14;
      const nameFs  = Math.max(9, innerR * 0.26);
      top.append('text')
        .attr('x', cx).attr('y', nameY)
        .attr('text-anchor', 'middle').attr('font-size', `${nameFs}px`)
        .attr('font-weight', '700').attr('fill', '#1c1917')
        .style('pointer-events', 'none').text(given);
      if (surname) {
        top.append('text')
          .attr('x', cx).attr('y', nameY + nameFs + 2)
          .attr('text-anchor', 'middle').attr('font-size', `${nameFs * 0.8}px`)
          .attr('fill', '#6b7280')
          .style('pointer-events', 'none').text(surname);
      }
      if (center.birthDate) {
        const yr = `Born: ${center.birthDate.match(/\d{4}/)?.[0] ?? center.birthDate}`;
        top.append('text')
          .attr('x', cx).attr('y', nameY + nameFs * 1.8 + 8)
          .attr('text-anchor', 'middle').attr('font-size', `${Math.max(7, nameFs * 0.72)}px`)
          .attr('fill', '#9ca3af')
          .style('pointer-events', 'none').text(yr);
      }
    }
  }

  // ── Sunburst ───────────────────────────────────────────────────────────────

  function drawSunburst() {
    if (!sunData) return;
    const el   = svgRef.current!;
    const cw   = containerRef.current!.clientWidth  || 720;
    const ch   = containerRef.current!.clientHeight || 580;
    const size = Math.min(cw, ch);
    const radius = size / 2 / (generations + 1);

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`);

    d3.select(el).append('rect')
      .attr('x', -size / 2).attr('y', -size / 2)
      .attr('width', size).attr('height', size)
      .attr('fill', '#f8f7f4');

    const hierarchy = d3.hierarchy<SunDatum>(sunData as never)
      .sum((d: SunDatum) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const partition = d3.partition<SunDatum>().size([2 * Math.PI, hierarchy.height + 1]);
    const root: never = partition(hierarchy as never);

    const topCount = (sunData.children?.length ?? 1) + 1;
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, topCount));

    const arc = d3.arc<never>()
      .startAngle((d: never) => (d as { x0: number }).x0)
      .endAngle((d: never)   => (d as { x1: number }).x1)
      .padAngle((d: never)   => Math.min(((d as { x1: number; x0: number }).x1 - (d as { x0: number }).x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: never) => (d as { y0: number }).y0 * radius)
      .outerRadius((d: never) => Math.max((d as { y0: number }).y0 * radius, (d as { y1: number }).y1 * radius - 1));

    const svg = d3.select(el);
    const g   = svg.append('g');

    function arcVisible(d: never) { const n = d as { y1: number; y0: number; x1: number; x0: number }; return n.y1 <= generations + 1 && n.y0 >= 1 && n.x1 > n.x0; }
    function labelVisible(d: never) { const n = d as { y1: number; y0: number; x1: number; x0: number }; return n.y1 <= generations + 1 && n.y0 >= 1 && (n.y1 - n.y0) * (n.x1 - n.x0) > 0.025; }
    function labelTransform(d: never) {
      const n = d as { x0: number; x1: number; y0: number; y1: number };
      const x = ((n.x0 + n.x1) / 2) * 180 / Math.PI;
      const y = ((n.y0 + n.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    g.append('g')
      .selectAll('path')
      .data((root as never as { descendants: () => never[] }).descendants().slice(1))
      .join('path')
      .attr('fill', (d: never) => {
        let n: never = d; while ((n as { depth: number }).depth > 1) n = (n as { parent: never }).parent;
        return color((n as { data: { name: string } }).data.name);
      })
      .attr('fill-opacity', (d: never) => arcVisible(d) ? ((d as { children?: unknown }).children ? 0.68 : 0.45) : 0)
      .attr('pointer-events', (d: never) => arcVisible(d) ? 'auto' : 'none')
      .attr('d', arc)
      .attr('stroke', 'white').attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('click', (_: unknown, d: never) => { setCenterId((d as { data: { id: string } }).data.id); onSelectPerson((d as { data: { id: string } }).data.id); })
      .on('mouseenter', (_: unknown, d: never) => setHoveredId((d as { data: { id: string } }).data.id))
      .on('mouseleave', () => setHoveredId(null))
      .append('title')
      .text((d: never) => (d as { ancestors: () => never[] }).ancestors().map((a: never) => (a as { data: { name: string } }).data.name).reverse().join(' › '));

    g.append('g')
      .attr('pointer-events', 'none').attr('text-anchor', 'middle').style('user-select', 'none')
      .selectAll('text')
      .data((root as never as { descendants: () => never[] }).descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em').attr('font-size', '9px').attr('fill', '#1c1917')
      .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
      .attr('fill-opacity', (d: never) => +labelVisible(d))
      .attr('transform', (d: never) => labelTransform(d))
      .text((d: never) => (d as { data: { name: string } }).data.name.split(' ')[0]);

    g.append('circle')
      .attr('r', radius).attr('fill', 'white').attr('stroke', '#d1d5db').attr('stroke-width', 1.5)
      .style('cursor', 'pointer').on('click', () => onSelectPerson(centerId));

    const center = persons.get(centerId);
    if (center) {
      const fs = Math.max(9, radius * 0.3);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.4em')
        .attr('font-size', `${fs}px`).attr('font-weight', '700').attr('fill', '#1c1917')
        .text(center.fullName.split(' ')[0]);
      g.append('text').attr('text-anchor', 'middle').attr('dy', '1em')
        .attr('font-size', `${Math.max(7, fs * 0.7)}px`).attr('fill', '#6b7280')
        .text(`${(root as never as { descendants: () => unknown[] }).descendants().length - 1} ${t ? 'אנשים' : 'people'}`);
    }
  }

  // ── Back handler ──────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (centerId !== rootPersonId) { setCenterId(rootPersonId); onSelectPerson(rootPersonId); }
  }, [centerId, rootPersonId, onSelectPerson]);

  const hoveredPerson = hoveredId ? persons.get(hoveredId) : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex-1 min-h-0 w-full flex flex-col"
      style={{ background: '#f8f7f4' }}
      dir={t ? 'rtl' : 'ltr'}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-stone-200 flex-shrink-0 flex-wrap shadow-sm">

        {/* Chart type toggle */}
        <div className="flex items-center rounded-lg bg-stone-100 p-0.5 gap-0.5">
          {([
            { id: 'fan',      icon: '🌀', labelHe: 'אבות',   labelEn: 'Ancestors'   },
            { id: 'sunburst', icon: '☀️', labelHe: 'צאצאים', labelEn: 'Descendants' },
          ] as { id: ChartType; icon: string; labelHe: string; labelEn: string }[]).map(ct => (
            <button
              key={ct.id}
              onClick={() => setChartType(ct.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                chartType === ct.id
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {ct.icon} {t ? ct.labelHe : ct.labelEn}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-stone-200" />

        {/* Generations dropdown style */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500 font-medium">
            {t ? 'דורות:' : 'Generations:'}
          </span>
          <div className="flex items-center rounded-md border border-stone-200 bg-white overflow-hidden">
            {[3, 4, 5, 6, 7].map(g => (
              <button
                key={g}
                onClick={() => setGenerations(g)}
                className={`px-2.5 py-1 text-xs font-bold transition-all border-r last:border-r-0 border-stone-200 ${
                  generations === g
                    ? 'bg-amber-500 text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Back button */}
        {centerId !== rootPersonId && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                       bg-stone-100 text-stone-700 hover:bg-stone-200
                       rounded-full transition-all border border-stone-200"
          >
            ← {t ? 'חזרה' : 'Back'}
          </button>
        )}

        {/* Search */}
        <div className="ms-auto relative">
          {searchOpen ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                placeholder={t ? 'חפש אדם...' : 'Find a person...'}
                className="border border-stone-300 rounded-lg px-3 py-1.5 text-xs w-44 focus:outline-none focus:border-amber-400"
              />
              {search && (
                <button onClick={() => { setSearch(''); setSearchOpen(false); }} className="text-stone-400 hover:text-stone-700 text-lg leading-none">×</button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg bg-white hover:border-stone-400 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {t ? 'חפש אדם...' : 'Find a person...'}
            </button>
          )}

          {/* Search dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 end-0 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-[200px]">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCenterId(p.id);
                    onSelectPerson(p.id);
                    setSearch('');
                    setSearchOpen(false);
                  }}
                  className="w-full text-start px-3 py-2 text-xs hover:bg-amber-50 flex items-center gap-2 border-b border-stone-100 last:border-b-0"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    p.sex === 'F' ? 'bg-pink-400' : p.sex === 'M' ? 'bg-blue-400' : 'bg-stone-400'
                  }`} />
                  <span className="font-medium text-stone-800">{p.fullName}</span>
                  {p.birthDate && <span className="text-stone-400 ms-auto">{p.birthDate.match(/\d{4}/)?.[0]}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Hover tooltip ────────────────────────────────────────────────────── */}
      {hoveredPerson && (
        <div className="flex-shrink-0 mx-4 mt-1.5 px-4 py-2 bg-white border border-stone-200 text-stone-800 rounded-xl text-sm shadow-md flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            hoveredPerson.sex === 'F' ? 'bg-pink-400' : hoveredPerson.sex === 'M' ? 'bg-blue-400' : 'bg-stone-400'
          }`} />
          <span className="font-semibold">{hoveredPerson.fullName}</span>
          {hoveredPerson.birthDate && (
            <span className="text-stone-500 text-xs">{yearRange(hoveredPerson.birthDate, hoveredPerson.deathDate)}</span>
          )}
          {hoveredPerson.birthPlace && (
            <span className="text-stone-400 text-xs">{getFlag(hoveredPerson.birthPlace)} {hoveredPerson.birthPlace}</span>
          )}
          <span className="ms-auto text-[10px] text-stone-400">{t ? 'לחץ לריכוז' : 'Click to centre'}</span>
        </div>
      )}

      {/* ── SVG canvas ───────────────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center p-2">
        <svg ref={svgRef} className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </div>

      {/* ── Footer legend ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-1.5 border-t border-stone-200 bg-white/80 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />{t ? 'גבר' : 'Male'}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />{t ? 'אישה' : 'Female'}</span>
        <span className="text-stone-300">·</span>
        <span>{nodes.filter(n => n.id).length} {t ? 'אנשים' : 'people'}</span>
        <span className="text-stone-300">·</span>
        <span className="text-stone-400">{t ? 'לחץ לריכוז' : 'Click segment to centre'}</span>
      </div>
    </div>
  );
}
