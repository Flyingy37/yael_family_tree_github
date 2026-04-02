import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { Person, Family } from '../types';

/* ── Generation palette ──────────────────────────────────────────────── */

const GENERATION_COLORS: Record<string, string> = {
  // Positive (descendants) → Teal
  '1': '#0d9488',
  '2': '#14b8a6',
  '3': '#2dd4bf',
  // Root → Amber
  '0': '#d97706',
  // Parents / grandparents → Amber shades
  '-1': '#f59e0b',
  '-2': '#fbbf24',
  // Great-grandparents → Indigo
  '-3': '#6366f1',
  '-4': '#818cf8',
  '-5': '#a5b4fc',
  // Further ancestors → Indigo-dark
  '-6': '#4f46e5',
  '-7': '#4338ca',
  '-8': '#3730a3',
  '-9': '#312e81',
  '-10': '#1e1b4b',
};

function getGenerationColor(gen: number | null): string {
  if (gen === null) return '#94a3b8';
  const key = String(Math.max(-10, Math.min(3, gen)));
  return GENERATION_COLORS[key] ?? '#6366f1';
}

/* ── Hierarchy node type ─────────────────────────────────────────────── */

interface TreeDatum {
  id: string;
  person: Person;
  children?: TreeDatum[];
}

/* ── Build a tree rooted at `rootId` ─────────────────────────────────── */

function buildHierarchy(
  rootId: string,
  persons: Map<string, Person>,
  families: Map<string, Family>,
  visibleIds: Set<string>,
  maxDepthUp: number,
  maxDepthDown: number,
): TreeDatum | null {
  const root = persons.get(rootId);
  if (!root || !visibleIds.has(rootId)) return null;

  // Build parent chain (upward) – we reverse the tree to go root → ancestors
  const visited = new Set<string>();

  function buildDown(personId: string, depth: number): TreeDatum | null {
    if (visited.has(personId) || !visibleIds.has(personId)) return null;
    const person = persons.get(personId);
    if (!person) return null;
    visited.add(personId);

    const kids: TreeDatum[] = [];
    if (depth < maxDepthDown) {
      for (const famId of person.familiesAsSpouse) {
        const fam = families.get(famId);
        if (!fam) continue;
        // Also add spouse as a "child" node in the visual tree for display
        for (const spouseId of fam.spouses) {
          if (spouseId !== personId && visibleIds.has(spouseId) && !visited.has(spouseId)) {
            // Don't recurse deeply into spouse to avoid cluttering
            const spouse = persons.get(spouseId);
            if (spouse) {
              visited.add(spouseId);
              kids.push({ id: spouseId, person: spouse });
            }
          }
        }
        for (const childId of fam.children) {
          const child = buildDown(childId, depth + 1);
          if (child) kids.push(child);
        }
      }
    }

    return {
      id: personId,
      person,
      children: kids.length > 0 ? kids : undefined,
    };
  }

  // Build upward (ancestors) then connect downward subtree
  function buildUp(personId: string, depth: number): TreeDatum | null {
    if (visited.has(personId) || !visibleIds.has(personId)) return null;
    const person = persons.get(personId);
    if (!person) return null;
    visited.add(personId);

    const parents: TreeDatum[] = [];
    if (depth < maxDepthUp && person.familyAsChild) {
      const fam = families.get(person.familyAsChild);
      if (fam) {
        for (const parentId of fam.spouses) {
          const parentNode = buildUp(parentId, depth + 1);
          if (parentNode) parents.push(parentNode);
        }
      }
    }

    // For the root person, also add descendants
    const kids: TreeDatum[] = [];
    if (personId === rootId) {
      for (const famId of person.familiesAsSpouse) {
        const fam = families.get(famId);
        if (!fam) continue;
        for (const spouseId of fam.spouses) {
          if (spouseId !== personId && visibleIds.has(spouseId) && !visited.has(spouseId)) {
            const spouse = persons.get(spouseId);
            if (spouse) {
              visited.add(spouseId);
              kids.push({ id: spouseId, person: spouse });
            }
          }
        }
        for (const childId of fam.children) {
          const child = buildDown(childId, 1);
          if (child) kids.push(child);
        }
      }
    }

    const allChildren = [...parents, ...kids];
    return {
      id: personId,
      person,
      children: allChildren.length > 0 ? allChildren : undefined,
    };
  }

  return buildUp(rootId, 0);
}

/* ── Component ───────────────────────────────────────────────────────── */

interface D3TreeViewProps {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  filteredIds: Set<string>;
  rootPersonId: string;
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

export function D3TreeView({
  persons,
  families,
  filteredIds,
  rootPersonId,
  selectedPersonId,
  onSelectPerson,
  language = 'en',
}: D3TreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const isRTL = language === 'he';
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build the hierarchy data
  const hierarchyData = useMemo(() => {
    return buildHierarchy(rootPersonId, persons, families, filteredIds, 4, 4);
  }, [rootPersonId, persons, families, filteredIds]);

  // Collapsed node tracking
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Pre-compute which nodes in the original hierarchy have children (for collapse indicator)
  const nodesWithChildren = useMemo(() => {
    const set = new Set<string>();
    if (!hierarchyData) return set;
    function walk(node: TreeDatum) {
      if (node.children && node.children.length > 0) {
        set.add(node.id);
        for (const ch of node.children) walk(ch);
      }
    }
    walk(hierarchyData);
    return set;
  }, [hierarchyData]);

  // Apply collapse to hierarchy
  const processedHierarchy = useMemo(() => {
    if (!hierarchyData) return null;

    function prune(node: TreeDatum): TreeDatum {
      if (collapsedIds.has(node.id) || !node.children) {
        return { ...node, children: undefined };
      }
      return {
        ...node,
        children: node.children.map(prune),
      };
    }
    return prune(hierarchyData);
  }, [hierarchyData, collapsedIds]);

  // Render D3 tree
  useEffect(() => {
    if (!processedHierarchy || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 40, right: 80, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create or select the main group
    let g = svg.select<SVGGElement>('g.tree-root');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'tree-root');
      gRef.current = g.node();
    }

    // Set up d3.tree layout
    const root = d3.hierarchy<TreeDatum>(processedHierarchy);
    const nodeCount = root.descendants().length;
    // Dynamic sizing based on node count
    const dynamicHeight = Math.max(innerHeight, nodeCount * 28);

    const treeLayout = d3.tree<TreeDatum>()
      .size([dynamicHeight, innerWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.4));

    treeLayout(root);

    // For RTL, flip x coordinates
    if (isRTL) {
      root.each(d => {
        d.y = innerWidth - (d.y ?? 0);
      });
    }

    // Translate group to account for margins
    g.attr('transform', `translate(${margin.left},${margin.top})`);

    // ── Links ──────────────────────────────────────────────────────
    const linkGenerator = isRTL
      ? d3.linkHorizontal<d3.HierarchyLink<TreeDatum>, d3.HierarchyPointNode<TreeDatum>>()
          .x(d => d.y ?? 0)
          .y(d => d.x ?? 0)
      : d3.linkHorizontal<d3.HierarchyLink<TreeDatum>, d3.HierarchyPointNode<TreeDatum>>()
          .x(d => d.y ?? 0)
          .y(d => d.x ?? 0);

    const links = g.selectAll<SVGPathElement, d3.HierarchyLink<TreeDatum>>('path.tree-link')
      .data(root.links(), d => `${d.source.data.id}-${d.target.data.id}`);

    // Exit
    links.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // Enter
    const linksEnter = links.enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke-width', 1.8)
      .attr('opacity', 0);

    // Update (merge enter + existing)
    const linksAll = linksEnter.merge(links);

    linksAll
      .attr('stroke', d => getGenerationColor(d.target.data.person.generation))
      .transition()
      .duration(500)
      .attr('opacity', 0.6)
      // d3 selection data is already HierarchyLink<TreeDatum> from root.links(); cast needed
      // because the merged selection generic doesn't narrow to the link accessor's expected type.
      .attr('d', d => linkGenerator(d as d3.HierarchyLink<TreeDatum>) ?? '');

    // ── Nodes ──────────────────────────────────────────────────────
    const nodes = g.selectAll<SVGGElement, d3.HierarchyPointNode<TreeDatum>>('g.tree-node')
      .data(root.descendants(), d => d.data.id);

    // Exit
    nodes.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // Enter
    const nodesEnter = nodes.enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('opacity', 0)
      .attr('cursor', 'pointer')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Circle
    nodesEnter.append('circle')
      .attr('r', 7)
      .attr('fill', '#F9F8F6')
      .attr('stroke-width', 2.5);

    // Name label
    nodesEnter.append('text')
      .attr('class', 'node-name')
      .attr('dy', '0.32em')
      .attr('font-family', "'Georgia', 'Noto Serif Hebrew', 'David Libre', serif")
      .attr('font-size', '11px')
      .attr('fill', '#44403c');

    // Collapse indicator (small + or − sign)
    nodesEnter.append('text')
      .attr('class', 'collapse-indicator')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#78716c')
      .attr('cursor', 'pointer');

    // Merge enter + existing
    const nodesAll = nodesEnter.merge(nodes);

    // Update positions
    nodesAll.transition()
      .duration(500)
      .attr('opacity', 1)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Update circle styling
    nodesAll.select('circle')
      .attr('stroke', d => getGenerationColor(d.data.person.generation))
      .attr('r', d => d.data.id === selectedPersonId ? 9 : 7)
      .attr('stroke-width', d => d.data.id === selectedPersonId ? 3.5 : 2.5)
      .attr('fill', d => d.data.id === selectedPersonId ? '#fffbeb' : '#F9F8F6');

    // Update name text
    nodesAll.select<SVGTextElement>('text.node-name')
      .attr('x', d => {
        const hasKids = d.data.children && d.data.children.length > 0;
        if (isRTL) return hasKids ? 14 : -14;
        return hasKids ? -14 : 14;
      })
      .attr('text-anchor', d => {
        const hasKids = d.data.children && d.data.children.length > 0;
        if (isRTL) return hasKids ? 'start' : 'end';
        return hasKids ? 'end' : 'start';
      })
      .text(d => {
        const p = d.data.person;
        return p.fullName;
      })
      .attr('font-weight', d => d.data.id === selectedPersonId ? '700' : '400')
      .attr('direction', isRTL ? 'rtl' : 'ltr');

    // Collapse indicator
    nodesAll.select<SVGTextElement>('text.collapse-indicator')
      .attr('x', d => (isRTL ? -12 : 12))
      .attr('y', 14)
      .text(d => {
        if (!d.children && !collapsedIds.has(d.data.id)) return '';
        if (!d.data.children || d.data.children.length === 0) return '';
        return collapsedIds.has(d.data.id) ? '+' : '−';
      })
      .attr('display', d => nodesWithChildren.has(d.data.id) ? 'block' : 'none');

    // Event handlers
    nodesAll
      .on('click', (_event, d) => {
        onSelectPerson(d.data.id);
      })
      .on('dblclick', (_event, d) => {
        toggleCollapse(d.data.id);
      });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg
      .call(zoom)
      .on('dblclick.zoom', null); // disable double-click zoom (we use it for collapse)

    // Initial fit
    const bounds = g.node()?.getBBox();
    if (bounds) {
      const fullWidth = bounds.width + margin.left + margin.right;
      const fullHeight = bounds.height + margin.top + margin.bottom;
      const scale = Math.min(
        width / fullWidth,
        height / fullHeight,
        1.2
      ) * 0.9;
      const translateX = (width - bounds.width * scale) / 2 - bounds.x * scale;
      const translateY = (height - bounds.height * scale) / 2 - bounds.y * scale;

      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );
    }

  }, [processedHierarchy, dimensions, selectedPersonId, isRTL, onSelectPerson, toggleCollapse, collapsedIds, nodesWithChildren]);

  const isHe = language === 'he';

  if (!hierarchyData) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 text-sm">
        {isHe ? 'לא ניתן לבנות עץ עבור הנתונים הנוכחיים' : 'Unable to build tree for current data'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ backgroundColor: '#F9F8F6' }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
      {/* Legend */}
      <div
        className="absolute bottom-3 flex items-center gap-3 rounded-lg border border-stone-200 bg-white/90 px-3 py-2 text-[10px] text-stone-600 shadow-sm backdrop-blur-sm"
        style={isRTL ? { right: 12 } : { left: 12 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <span className="font-semibold text-stone-700">{isHe ? 'מקרא:' : 'Legend:'}</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: '#d97706' }} />
          {isHe ? 'שורש' : 'Root'}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: '#f59e0b' }} />
          {isHe ? 'הורים' : 'Parents'}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: '#6366f1' }} />
          {isHe ? 'אבות קדמונים' : 'Ancestors'}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: '#0d9488' }} />
          {isHe ? 'צאצאים' : 'Descendants'}
        </span>
        <span className="text-stone-400">|</span>
        <span>{isHe ? 'לחיצה = בחירה · לחיצה כפולה = קפל/פרוס' : 'Click = select · Double-click = collapse/expand'}</span>
      </div>
    </div>
  );
}
