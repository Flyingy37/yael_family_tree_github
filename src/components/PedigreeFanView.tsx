/**
 * PedigreeFanView — radial ancestor fan chart (like MyHeritage "Fan view").
 * Center = selected person. Each ring = one generation of ancestors.
 * Click a segment to re-center on that person.
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
  generation: number; // 0 = root, 1 = parents, 2 = grandparents …
  position: number;   // index within generation (0-based)
  fatherId: string | null;
  motherId: string | null;
}

// Depth of generations to show (root + N ancestor rings)
const MAX_GENERATIONS = 6;

// Branch colors — one per side of root (paternal/maternal split then further)
const BRANCH_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#14b8a6', '#f59e0b', '#84cc16', '#3b82f6',
  '#8b5cf6', '#f43f5e', '#10b981', '#0ea5e9',
];

function getBranchColor(position: number, generation: number): string {
  if (generation === 0) return '#fef3c7';
  // Each person in gen 1 is a branch root
  const branchCount = Math.pow(2, generation);
  const branchIdx = Math.floor(position / (branchCount / Math.min(branchCount, BRANCH_COLORS.length)));
  return BRANCH_COLORS[branchIdx % BRANCH_COLORS.length];
}

function lightenColor(hex: string, amount: number): string {
  // Mix with white
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * amount);
  const ng = Math.round(g + (255 - g) * amount);
  const nb = Math.round(b + (255 - b) * amount);
  return `rgb(${nr},${ng},${nb})`;
}

export function PedigreeFanView({ persons, families, rootPersonId, onSelectPerson, language = 'he' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerId, setCenterId] = useState(rootPersonId);
  const [generations, setGenerations] = useState(5);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const t = language === 'he';

  // Build flat ancestor list from centerId
  const nodes = useMemo<FanNode[]>(() => {
    const result: FanNode[] = [];

    function getParents(personId: string): { fatherId: string | null; motherId: string | null } {
      const person = persons.get(personId);
      if (!person?.familyAsChild) return { fatherId: null, motherId: null };
      const fam = families.get(person.familyAsChild);
      if (!fam) return { fatherId: null, motherId: null };
      const father = fam.spouses.find(id => persons.get(id)?.sex === 'M') ?? null;
      const mother = fam.spouses.find(id => persons.get(id)?.sex === 'F') ?? null;
      return { fatherId: father, motherId: mother };
    }

    // BFS by generation
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
          birthPlace: person.birthPlace,
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

  const centerPerson = useMemo(() => persons.get(centerId), [centerId, persons]);

  // Draw D3 fan
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const el = svgRef.current;
    const containerWidth = containerRef.current.clientWidth || 700;
    const containerHeight = containerRef.current.clientHeight || 600;
    const size = Math.min(containerWidth, containerHeight);
    const cx = size / 2;
    const cy = size / 2;

    d3.select(el).selectAll('*').remove();
    el.setAttribute('viewBox', `0 0 ${size} ${size}`);

    const svg = d3.select(el);
    const g = svg.append('g');

    const maxGen = Math.max(...nodes.map(n => n.generation));
    const ringWidth = (size * 0.45) / Math.max(maxGen, 1);
    const innerR = size * 0.09; // center circle radius

    // Group nodes by generation
    const byGen = new Map<number, FanNode[]>();
    for (const n of nodes) {
      if (!byGen.has(n.generation)) byGen.set(n.generation, []);
      byGen.get(n.generation)!.push(n);
    }

    // Draw each generation ring
    for (const [gen, genNodes] of byGen.entries()) {
      if (gen === 0) continue; // center handled separately

      const outerR = innerR + gen * ringWidth;
      const innerRing = innerR + (gen - 1) * ringWidth;
      const totalSlots = Math.pow(2, gen);
      const anglePerSlot = (2 * Math.PI) / totalSlots;

      // Start from top (-π/2)
      const startAngle = -Math.PI / 2;

      for (const node of genNodes) {
        const slotStart = startAngle + node.position * anglePerSlot;
        const slotEnd = slotStart + anglePerSlot;
        const midAngle = (slotStart + slotEnd) / 2;

        const baseColor = getBranchColor(node.position, gen);
        const fillColor = lightenColor(baseColor, gen * 0.07);
        const isHovered = node.id === hoveredId;

        const arcGen = d3.arc<void>()
          .innerRadius(innerRing + 2)
          .outerRadius(isHovered ? outerR + 4 : outerR - 1)
          .startAngle(slotStart + 0.01)
          .endAngle(slotEnd - 0.01)
          .padAngle(0.02)
          .cornerRadius(3);

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
          .on('click', () => {
            setCenterId(node.id);
            onSelectPerson(node.id);
          });

        // Label
        const arcRadius = (innerRing + outerR) / 2;
        const lx = cx + arcRadius * Math.cos(midAngle);
        const ly = cy + arcRadius * Math.sin(midAngle);
        const angleDeg = midAngle * (180 / Math.PI);
        const textAngle = angleDeg < 0 ? angleDeg + 90 : angleDeg > 90 ? angleDeg - 90 : angleDeg;

        // Only show label if arc is wide enough
        const arcWidth = anglePerSlot * arcRadius;
        if (arcWidth > 20) {
          const labelGroup = g.append('g')
            .attr('transform', `translate(${lx},${ly}) rotate(${angleDeg + 90})`)
            .style('pointer-events', 'none');

          // First name only for small arcs, full name for large
          const displayName = arcWidth > 50 ? node.name : node.name.split(' ')[0];
          const fontSize = Math.max(7, Math.min(11, arcWidth / 6));

          labelGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', `${fontSize}px`)
            .attr('font-weight', gen <= 2 ? '600' : '400')
            .attr('fill', gen <= 2 ? '#1c1917' : '#374151')
            .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
            .text(displayName);

          if (arcWidth > 70 && node.birthDate) {
            const year = node.birthDate.split(' ').pop() ?? '';
            labelGroup.append('text')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('dy', `${fontSize + 2}px`)
              .attr('font-size', `${Math.max(6, fontSize - 2)}px`)
              .attr('fill', '#6b7280')
              .text(year);
          }
        }

        // Gender indicator dot
        const dotR = Math.max(3, ringWidth * 0.06);
        const dotX = cx + (outerR - 6) * Math.cos(midAngle);
        const dotY = cy + (outerR - 6) * Math.sin(midAngle);
        g.append('circle')
          .attr('cx', dotX).attr('cy', dotY).attr('r', dotR)
          .attr('fill', node.sex === 'F' ? '#f9a8d4' : node.sex === 'M' ? '#93c5fd' : '#d1d5db')
          .attr('stroke', 'white').attr('stroke-width', 1)
          .style('pointer-events', 'none');
      }
    }

    // Center circle
    g.append('circle')
      .attr('cx', cx).attr('cy', cy)
      .attr('r', innerR - 2)
      .attr('fill', '#fef9f0')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', () => {
        onSelectPerson(centerId);
      });

    // Center name
    const center = persons.get(centerId);
    if (center) {
      const firstName = center.fullName.split(' ')[0];
      g.append('text')
        .attr('x', cx).attr('y', cy - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${Math.max(9, innerR * 0.28)}px`)
        .attr('font-weight', '700')
        .attr('fill', '#92400e')
        .text(firstName);

      const surname = center.fullName.split(' ').slice(1).join(' ');
      if (surname) {
        g.append('text')
          .attr('x', cx).attr('y', cy + 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', `${Math.max(7, innerR * 0.22)}px`)
          .attr('fill', '#a16207')
          .text(surname);
      }
    }

    // Generation rings (faint guide lines)
    for (let gen = 1; gen <= maxGen; gen++) {
      const r = innerR + gen * ringWidth;
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 0.5)
        .style('pointer-events', 'none');
    }

  }, [nodes, centerId, hoveredId, persons, onSelectPerson, generations]);

  const handleBack = useCallback(() => {
    if (centerId !== rootPersonId) {
      setCenterId(rootPersonId);
      onSelectPerson(rootPersonId);
    }
  }, [centerId, rootPersonId, onSelectPerson]);

  const hoveredPerson = hoveredId ? persons.get(hoveredId) : null;

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-gradient-to-br from-stone-50 to-amber-50" dir={t ? 'rtl' : 'ltr'}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-stone-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <div>
            <h2 className="text-sm font-bold text-stone-900 leading-tight">
              {t ? 'תרשים אבות' : 'Ancestor Fan'}
            </h2>
            <p className="text-[11px] text-stone-400">
              {t ? 'לחצי על אדם לריכוז עליו · לחצי שוב להצגת פרטים' : 'Click person to center · click again for details'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ms-auto">
          {/* Generations selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500">{t ? 'דורות:' : 'Generations:'}</span>
            {[3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => setGenerations(g)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  generations === g
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Back to root */}
          {centerId !== rootPersonId && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full transition-all border border-amber-200"
            >
              ← {t ? 'חזרה ליעל' : 'Back to Yael'}
            </button>
          )}
        </div>
      </div>

      {/* ── Hover tooltip ── */}
      {hoveredPerson && (
        <div className="flex-shrink-0 mx-4 mt-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm shadow-lg flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            hoveredPerson.sex === 'F' ? 'bg-pink-400' : hoveredPerson.sex === 'M' ? 'bg-blue-400' : 'bg-stone-400'
          }`} />
          <span className="font-semibold">{hoveredPerson.fullName}</span>
          {hoveredPerson.birthDate && <span className="text-stone-300 text-xs">נ׳ {hoveredPerson.birthDate}</span>}
          {hoveredPerson.birthPlace && <span className="text-stone-400 text-xs">· {hoveredPerson.birthPlace}</span>}
          <span className="ms-auto text-[10px] text-stone-400">{t ? 'לחץ לריכוז' : 'Click to center'}</span>
        </div>
      )}

      {/* ── Fan chart ── */}
      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center p-4">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* ── Legend ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 px-4 py-2 border-t border-stone-100 bg-white text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300" />{t ? 'גבר' : 'Male'}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-300" />{t ? 'אישה' : 'Female'}</span>
        <span className="text-stone-300">·</span>
        <span>{t ? `${nodes.length} אנשים מוצגים` : `${nodes.length} people shown`}</span>
      </div>
    </div>
  );
}
