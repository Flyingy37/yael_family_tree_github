/**
 * FamilyTreeVisual — a D3-powered family tree rendered as SVG.
 *
 * This component takes a HierarchyNode (nested JSON) and draws a
 * horizontal tree with curved links, minimalist circle nodes, and
 * serif-styled name labels.
 *
 * It supports zoom/pan via d3.zoom and animates path & circle
 * transitions via CSS (see index.css).
 */
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { HierarchyNode } from '../utils/buildHierarchy';

interface FamilyTreeVisualProps {
  data: HierarchyNode;
}

export const FamilyTreeVisual: React.FC<FamilyTreeVisualProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    /* ── Layout ─────────────────────────────────────────────────── */
    const treeLayout = d3.tree<HierarchyNode>().nodeSize([40, 200]);
    const root = d3.hierarchy<HierarchyNode>(data);
    treeLayout(root);

    // Compute bounding box so we can size the SVG to fit the tree
    let x0 = Infinity;
    let x1 = -Infinity;
    root.each((d) => {
      const px = d.x ?? 0;
      if (px < x0) x0 = px;
      if (px > x1) x1 = px;
    });
    const height = x1 - x0 + margin.top + margin.bottom + 40;
    const width = (root.height + 1) * 200 + margin.left + margin.right;

    /* ── SVG setup ──────────────────────────────────────────────── */
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('width', '100%')
      .attr('height', '100%');

    // Clear previous render
    svg.selectAll('*').remove();

    // Container with zoom/pan
    const container = svg.append('g');
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          container.attr('transform', event.transform);
        }) as unknown as (selection: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void,
    );

    const g = container.append('g').attr(
      'transform',
      `translate(${margin.left},${margin.top - x0 + 20})`,
    );

    /* ── Links (curved paths) ───────────────────────────────────── */
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#D6D3D1')
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('class', 'd3-tree-link')
      .attr(
        'd',
        d3
          .linkHorizontal<
            d3.HierarchyLink<HierarchyNode>,
            d3.HierarchyPointNode<HierarchyNode>
          >()
          .x((d) => d.y)
          .y((d) => d.x) as unknown as (
          d: d3.HierarchyLink<HierarchyNode>,
        ) => string,
      );

    /* ── Nodes ──────────────────────────────────────────────────── */
    const node = g
      .append('g')
      .selectAll<SVGGElement, d3.HierarchyPointNode<HierarchyNode>>('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node
      .append('circle')
      .attr('class', 'd3-tree-circle')
      .attr('r', 5)
      .attr('fill', '#fff')
      .attr('stroke', (d) => d.data.color || '#78716C')
      .attr('stroke-width', 2);

    // Name labels — serif style for a classic genealogy feel
    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', (d) => (d.children ? -10 : 10))
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .attr('class', 'd3-tree-label')
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);
  }, [data]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full min-h-[500px] d3-tree-svg"
    />
  );
};

export default FamilyTreeVisual;
