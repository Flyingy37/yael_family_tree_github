import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { Person, Family } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface HierarchyDatum {
  id: string;
  name: string;
  sex: 'M' | 'F' | 'U';
  birthYear: number | null;
  deathYear: number | null;
  birthPlace: string | null;
  children?: HierarchyDatum[];
  /** Internal: collapsed state */
  _children?: HierarchyDatum[];
}

interface FamilyD3TreeProps {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  rootPersonId: string;
  onSelectPerson?: (id: string) => void;
  language?: 'en' | 'he';
  maxDepth?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

/** Build d3-compatible hierarchy from flat person/family maps. */
function buildHierarchy(
  rootId: string,
  persons: Map<string, Person>,
  families: Map<string, Family>,
  maxDepth: number,
): HierarchyDatum | null {
  const person = persons.get(rootId);
  if (!person) return null;

  const visited = new Set<string>();

  function walk(id: string, depth: number): HierarchyDatum | null {
    if (visited.has(id) || depth > maxDepth) return null;
    visited.add(id);

    const p = persons.get(id);
    if (!p) return null;

    const node: HierarchyDatum = {
      id: p.id,
      name: p.fullName,
      sex: p.sex,
      birthYear: extractYear(p.birthDate),
      deathYear: extractYear(p.deathDate),
      birthPlace: p.birthPlace,
    };

    const childIds: string[] = [];
    for (const famId of p.familiesAsSpouse) {
      const fam = families.get(famId);
      if (!fam) continue;
      for (const childId of fam.children) {
        if (!visited.has(childId)) childIds.push(childId);
      }
    }

    if (childIds.length > 0) {
      const childNodes = childIds
        .map(cid => walk(cid, depth + 1))
        .filter((c): c is HierarchyDatum => c !== null);
      if (childNodes.length > 0) {
        node.children = childNodes;
      }
    }

    return node;
  }

  return walk(rootId, 0);
}

// ── Theme colors (Stone archive palette) ─────────────────────────────────────

const THEME = {
  bg: '#fafaf9',           // stone-50
  text: '#1c1917',         // stone-900
  textMuted: '#78716c',    // stone-500
  line: '#a8a29e',         // stone-400
  nodeBg: '#ffffff',
  nodeBorder: '#d6d3d1',   // stone-300
  nodeBorderMale: '#a8a29e',   // stone-400
  nodeBorderFemale: '#57534e', // stone-600
  highlight: '#44403c',    // stone-700
};

// ── Component ────────────────────────────────────────────────────────────────

const FamilyD3Tree: React.FC<FamilyD3TreeProps> = ({
  persons,
  families,
  rootPersonId,
  onSelectPerson,
  language = 'he',
  maxDepth = 6,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const isHe = language === 'he';

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (id: string) => {
      onSelectPerson?.(id);
    },
    [onSelectPerson],
  );

  useEffect(() => {
    if (!svgRef.current || persons.size === 0) return;

    const rootData = buildHierarchy(rootPersonId, persons, families, maxDepth);
    if (!rootData) return;

    const { width, height } = dimensions;
    const margin = { top: 40, right: 90, bottom: 40, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', "'Frank Ruhl Libre', 'David Libre', Georgia, serif");

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Build hierarchy
    const root = d3.hierarchy(rootData);
    const treeLayout = d3.tree<HierarchyDatum>().size([innerHeight, innerWidth]);
    treeLayout(root);

    // Toggle collapse on click
    function toggle(d: d3.HierarchyPointNode<HierarchyDatum>) {
      if (d.data.children) {
        d.data._children = d.data.children;
        d.data.children = undefined;
      } else if (d.data._children) {
        d.data.children = d.data._children;
        d.data._children = undefined;
      }
    }

    // Links
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', THEME.line)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6)
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<HierarchyDatum>, d3.HierarchyPointNode<HierarchyDatum>>()
        .x(d => d.y!)
        .y(d => d.x!) as never);

    // Nodes
    const nodeGroup = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        toggle(d);
        // Re-render by updating the effect deps won't work directly,
        // so we use the handleNodeClick for selection
        handleNodeClick(d.data.id);
      });

    // Node card background
    const nodeW = 140;
    const nodeH = 52;
    nodeGroup.append('rect')
      .attr('x', -nodeW / 2)
      .attr('y', -nodeH / 2)
      .attr('width', nodeW)
      .attr('height', nodeH)
      .attr('rx', 4)
      .attr('fill', THEME.nodeBg)
      .attr('stroke', d => {
        if (d.data.sex === 'M') return THEME.nodeBorderMale;
        if (d.data.sex === 'F') return THEME.nodeBorderFemale;
        return THEME.nodeBorder;
      })
      .attr('stroke-width', 1);

    // Gender indicator — thin left stripe
    nodeGroup.append('rect')
      .attr('x', -nodeW / 2)
      .attr('y', -nodeH / 2)
      .attr('width', 3)
      .attr('height', nodeH)
      .attr('rx', 1)
      .attr('fill', d => {
        if (d.data.sex === 'M') return THEME.nodeBorderMale;
        if (d.data.sex === 'F') return THEME.nodeBorderFemale;
        return THEME.nodeBorder;
      });

    // Name text
    nodeGroup.append('text')
      .attr('dy', -6)
      .attr('text-anchor', 'middle')
      .attr('fill', THEME.text)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text(d => {
        const name = d.data.name;
        return name.length > 18 ? name.slice(0, 17) + '…' : name;
      });

    // Date text
    nodeGroup.append('text')
      .attr('dy', 10)
      .attr('text-anchor', 'middle')
      .attr('fill', THEME.textMuted)
      .attr('font-size', '9px')
      .text(d => {
        const b = d.data.birthYear;
        const dd = d.data.deathYear;
        if (b && dd) return `${b} – ${dd}`;
        if (b) return `${isHe ? 'לידה' : 'b.'} ${b}`;
        if (dd) return `${isHe ? 'פטירה' : 'd.'} ${dd}`;
        return '';
      });

    // Collapse indicator
    nodeGroup.filter(d => !!(d.data.children || d.data._children))
      .append('circle')
      .attr('cx', nodeW / 2 + 8)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', d => d.data._children ? THEME.textMuted : THEME.bg)
      .attr('stroke', THEME.line)
      .attr('stroke-width', 1);

    nodeGroup.filter(d => !!(d.data.children || d.data._children))
      .append('text')
      .attr('x', nodeW / 2 + 8)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.data._children ? THEME.nodeBg : THEME.textMuted)
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text(d => d.data._children ? '+' : '−');

    // Hover effect
    nodeGroup
      .on('mouseenter', function () {
        d3.select(this).select('rect:first-of-type')
          .transition()
          .duration(150)
          .attr('stroke', THEME.highlight)
          .attr('stroke-width', 1.5);
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).select('rect:first-of-type')
          .transition()
          .duration(150)
          .attr('stroke', d.data.sex === 'M' ? THEME.nodeBorderMale : d.data.sex === 'F' ? THEME.nodeBorderFemale : THEME.nodeBorder)
          .attr('stroke-width', 1);
      });

    // Zoom + pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Initial fit
    const initialTransform = d3.zoomIdentity
      .translate(margin.left, margin.top);
    svg.call(zoom.transform, initialTransform);

  }, [persons, families, rootPersonId, dimensions, maxDepth, isHe, handleNodeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] bg-stone-50 rounded border border-stone-200 overflow-hidden"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default FamilyD3Tree;
