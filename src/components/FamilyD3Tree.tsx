import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { Person, Family } from '../types';

interface TreeNode {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  birthYear?: number;
  birthPlace?: string;
  branch?: string;
  children?: TreeNode[];
  _children?: TreeNode[];
  x0?: number;
  y0?: number;
}

interface ExtendedNode extends d3.HierarchyPointNode<TreeNode> {
  x0?: number;
  y0?: number;
  _children?: TreeNode[];
}

interface Props {
  rootPersonId: string;
  persons: Map<string, Person>;
  families: Map<string, Family>;
  language?: 'he' | 'en';
  onSelectPerson?: (id: string) => void;
}

const GENDER_COLORS: Record<'M' | 'F' | 'U', { stroke: string; fill: string }> = {
  M: { stroke: '#38bdf8', fill: '#0ea5e9' },
  F: { stroke: '#fb7185', fill: '#f43f5e' },
  U: { stroke: '#94a3b8', fill: '#64748b' },
};

const LINK_COLORS = {
  default: '#d6d3d1',
  active: '#f59e0b',
};

export function FamilyD3Tree({ rootPersonId, persons, families, language = 'he', onSelectPerson }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const isRTL = language === 'he';

  const buildHierarchy = useCallback((): TreeNode | null => {
    const person = persons.get(rootPersonId);
    if (!person) return null;

    const visited = new Set<string>();

    function buildNode(personId: string, depth: number = 0): TreeNode {
      if (visited.has(personId) || depth > 10) {
        return { id: personId, name: '...', gender: 'U' };
      }
      visited.add(personId);

      const p = persons.get(personId);
      const node: TreeNode = {
        id: personId,
        name: p?.fullName || personId,
        gender: p?.sex === 'F' ? 'F' : 'M',
        birthYear: p?.birthDate ? parseInt(p.birthDate.split(' ').pop() || '0') : undefined,
        birthPlace: p?.birthPlace || undefined,
        branch: p?.surnameFinal || p?.surname || undefined,
      };

      const childFamily = p?.familyAsChild ? families.get(p.familyAsChild) : null;
      const parentIds = childFamily?.spouses.filter(id => id !== personId) || [];
      const childIds = childFamily?.children.filter(id => id !== personId) || [];

      const parents = parentIds
        .filter(id => !visited.has(id))
        .slice(0, 2)
        .map(id => buildNode(id, depth + 1));

      const children = childIds
        .filter(id => !visited.has(id))
        .slice(0, 5)
        .map(id => buildNode(id, depth + 1));

      if (parents.length > 0) node._children = parents;
      if (children.length > 0) node.children = children;

      return node;
    }

    return buildNode(rootPersonId);
  }, [rootPersonId, persons, families]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 900, height: Math.max(500, rect.height || 600) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !persons.size) return;

    const data = buildHierarchy();
    if (!data) return;

    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2 - 80;
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();
    svg.attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    const tree = d3.tree<TreeNode>().size([2 * Math.PI, radius]);
    const root = d3.hierarchy(data);

    let currentRoot = root as ExtendedNode;

    function update(source: ExtendedNode) {
      const treeData = tree(currentRoot);
      const nodes: ExtendedNode[] = treeData.descendants() as ExtendedNode[];
      const links = treeData.links() as d3.HierarchyPointLink<TreeNode>[];

      const duration = 300;

      nodes.forEach(d => {
        d.y = d.depth * 70;
      });

      const node = g.selectAll<SVGGElement, ExtendedNode>('g.node')
        .data(nodes, d => d.data.id);

      const nodeEnter = node.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${source.y0 || 0},${source.x0 || 0})`)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d.data.id);
          onSelectPerson?.(d.data.id);
        })
        .on('dblclick', (event, d) => {
          event.stopPropagation();
          toggleChildren(d.data);
        });

      nodeEnter.append('circle')
        .attr('r', 8)
        .attr('fill', d => GENDER_COLORS[d.data.gender]?.fill || '#94a3b8')
        .attr('stroke', d => GENDER_COLORS[d.data.gender]?.stroke || '#64748b')
        .attr('stroke-width', 2);

      nodeEnter.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.children ? -12 : 12)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .attr('fill', '#374151')
        .attr('font-size', '11px')
        .attr('font-family', 'Heebo, sans-serif')
        .text(d => {
          const name = d.data.name.split(' ')[0];
          return d.data.birthYear ? `${name} (${d.data.birthYear})` : name;
        })
        .clone(true).lower()
        .attr('stroke', '#fff')
        .attr('stroke-width', 3);

      nodeEnter.append('title')
        .text(d => `${d.data.name}\n${d.data.birthPlace || ''}`);

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate.transition().duration(duration)
        .attr('transform', d => {
          const angle = (d.x - Math.PI / 2) * (isRTL ? -1 : 1);
          return `translate(${d.y * Math.cos(angle)},${d.y * Math.sin(angle)})`;
        });

      node.exit().transition().duration(duration)
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .remove();

      const link = g.selectAll<SVGPathElement, typeof links[0]>('path.link')
        .data(links, d => `${d.source.data.id}-${d.target.data.id}`);

      const linkEnter = link.enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', LINK_COLORS.default)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6)
        .attr('d', () => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return diagonal({ source: o, target: o } as typeof links[0]);
        });

      linkEnter.merge(link).transition().duration(duration)
        .attr('d', d => {
          const angle = isRTL ? -1 : 1;
          const sx = d.source.y * Math.cos(d.source.x * angle - Math.PI / 2);
          const sy = d.source.y * Math.sin(d.source.x * angle - Math.PI / 2);
          const tx = d.target.y * Math.cos(d.target.x * angle - Math.PI / 2);
          const ty = d.target.y * Math.sin(d.target.x * angle - Math.PI / 2);
          return `M${sx},${sy}C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`;
        })
        .attr('stroke', d => selectedNode === d.target.data.id ? LINK_COLORS.active : LINK_COLORS.default);

      link.exit().transition().duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o } as typeof links[0]);
        })
        .remove();

      nodes.forEach(d => {
        const ext = d as ExtendedNode;
        ext.x0 = d.x;
        ext.y0 = d.y;
      });
    }

    function diagonal(d: { source: { x: number; y: number }; target: { x: number; y: number } }) {
      const angle = isRTL ? -1 : 1;
      const sx = d.source.y * Math.cos(d.source.x * angle - Math.PI / 2);
      const sy = d.source.y * Math.sin(d.source.x * angle - Math.PI / 2);
      const tx = d.target.y * Math.cos(d.target.x * angle - Math.PI / 2);
      const ty = d.target.y * Math.sin(d.target.x * angle - Math.PI / 2);
      return `M${sx},${sy}C${(sx + tx) / 2},${sy} ${(sx + tx) / 2},${ty} ${tx},${ty}`;
    }

    (currentRoot as ExtendedNode).x0 = Math.PI / 2;
    (currentRoot as ExtendedNode).y0 = 0;

    update(currentRoot);

    function toggleChildren(d: TreeNode) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
      } else if (d._children) {
        d.children = d._children;
        d._children = undefined;
      }
        update(currentRoot);
    }

    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));

  }, [buildHierarchy, dimensions, isRTL, onSelectPerson, selectedNode, persons.size]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-stone-50 rounded-2xl shadow-inner overflow-hidden"
    >
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ fontFamily: 'Heebo, sans-serif' }}
      />

      <div className="absolute bottom-4 start-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-stone-600 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-sky-400 border-2 border-sky-600" />
            {isRTL ? 'זכר' : 'Male'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-rose-400 border-2 border-rose-600" />
            {isRTL ? 'נקבה' : 'Female'}
          </span>
        </div>
        <div className="mt-1 text-stone-400">
          {isRTL ? 'גלול לזום • לחיצה כפולה לכווץ/להרחיב' : 'Scroll to zoom • Double-click to collapse/expand'}
        </div>
      </div>
    </div>
  );
}
