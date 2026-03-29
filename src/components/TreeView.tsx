import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import { RouteIcon, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './PersonNode';
import { GenerationBandNode } from './GenerationBandNode';
import { computeLayout, NODE_HEIGHT, type LayoutEdge } from '../utils/layout';
import { getDescendantIds, findPathBFS, countDescendantsMap } from '../utils/treeHelpers';
import { useExpandCollapse } from '../hooks/useExpandCollapse';
import type { Person, Family } from '../types';
import { formatPersonLifespanLine } from '../utils/formatters';

const BAND_HEIGHT = NODE_HEIGHT + 100; // node height + ranksep gap
const BAND_X_OFFSET = -5000;           // far left so band spans full viewport

const nodeTypes = {
  person: PersonNode,
  generationBand: GenerationBandNode,
};

/** Parent–child layout edges use the first visible spouse as `source`; BFS may traverse another spouse. */
function isPathHighlightedEdge(
  edge: LayoutEdge,
  pathEdgePairs: Set<string>,
  familiesMap: Map<string, Family>,
  visiblePersonIds: Set<string>
): boolean {
  if (pathEdgePairs.has(`${edge.source}:${edge.target}`)) return true;
  if (edge.type !== 'parent-child' || !edge.familyId) return false;
  const family = familiesMap.get(edge.familyId);
  if (!family) return false;
  const childId = edge.target;
  for (const spouseId of family.spouses) {
    if (!visiblePersonIds.has(spouseId)) continue;
    if (pathEdgePairs.has(`${spouseId}:${childId}`)) return true;
  }
  return false;
}

interface Props {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  filteredIds: Set<string>;
  rootPersonId: string;
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  onFocusSubtree?: (id: string) => void;
  language?: 'en' | 'he';
}

export function TreeView({
  persons,
  families,
  filteredIds,
  rootPersonId,
  selectedPersonId,
  onSelectPerson,
  onFocusSubtree,
  language = 'en',
}: Props) {
  const { fitView } = useReactFlow();
  const t = language === 'he';

  // ── Lazy load (large graphs): initial neighborhood around root, expand by hop ──
  const {
    graphVisibleIds,
    expandBranch,
    expandTick,
    isLazyMode,
    hasHiddenRelatives,
    hiddenRelativeCount,
  } = useExpandCollapse(rootPersonId, filteredIds, persons, families);

  // After expanding a branch, re-center the viewport (double rAF: layout then measure)
  useEffect(() => {
    if (expandTick === 0) return;
    const outer = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitView({ duration: 480, padding: 0.15, includeHiddenNodes: false });
      });
    });
    return () => cancelAnimationFrame(outer);
  }, [expandTick, fitView]);

  const handleExpandBranch = useCallback(
    (id: string) => {
      expandBranch(id);
    },
    [expandBranch]
  );

  // ── Collapse state ────────────────────────────────────────────────────────
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Reset collapse state when the filtered set changes substantially
  useEffect(() => {
    setCollapsedIds(new Set());
  }, [filteredIds]);

  const handleToggleCollapse = useCallback((id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Effective display: lazy-visible ∩ filter, then hide collapsed subtrees
  const effectiveDisplayIds = useMemo(() => {
    const base = graphVisibleIds;
    if (collapsedIds.size === 0) return base;
    const result = new Set(base);
    for (const cId of collapsedIds) {
      if (!result.has(cId)) continue;
      const descendants = getDescendantIds(cId, persons, families);
      for (const dId of descendants) result.delete(dId);
    }
    return result;
  }, [graphVisibleIds, collapsedIds, persons, families]);

  // Total descendant counts per person (all generations, full dataset)
  const descendantCountMap = useMemo(
    () => countDescendantsMap(persons, families),
    [persons, families]
  );

  // Which nodes have visible children (used to show collapse button)
  const hasChildrenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person) continue;
      map.set(
        id,
        person.familiesAsSpouse.some(famId => {
          const fam = families.get(famId);
          return fam ? fam.children.some(c => filteredIds.has(c)) : false;
        })
      );
    }
    return map;
  }, [filteredIds, persons, families]);

  // ── Path-find state ───────────────────────────────────────────────────────
  const [pathMode, setPathMode] = useState(false);
  const [pathPersonA, setPathPersonA] = useState<string | null>(null);
  const [pathResult, setPathResult] = useState<string[] | null>(null); // ordered IDs on path

  const pathHighlightIds = useMemo(
    () => (pathResult ? new Set(pathResult) : new Set<string>()),
    [pathResult]
  );

  // Set of "source:target" pairs for consecutive path nodes (undirected)
  const pathEdgePairs = useMemo(() => {
    if (!pathResult || pathResult.length < 2) return new Set<string>();
    const pairs = new Set<string>();
    for (let i = 0; i < pathResult.length - 1; i++) {
      pairs.add(`${pathResult[i]}:${pathResult[i + 1]}`);
      pairs.add(`${pathResult[i + 1]}:${pathResult[i]}`);
    }
    return pairs;
  }, [pathResult]);

  const togglePathMode = useCallback(() => {
    setPathMode(prev => {
      if (!prev) {
        // Entering path mode: clear previous result
        setPathResult(null);
        setPathPersonA(null);
      } else {
        setPathPersonA(null);
      }
      return !prev;
    });
  }, []);

  // ── Layout ────────────────────────────────────────────────────────────────
  /**
   * Lazy mode: one Dagre pass over the full filtered set; visibility is toggled with
   * React Flow `node.hidden` / `edge.hidden` so expand/collapse does not re-run Dagre.
   * Non-lazy: Dagre only on the visible subset (small graphs).
   */
  const fullLazyLayout = useMemo(() => {
    if (!isLazyMode || filteredIds.size === 0) return null;
    return computeLayout(persons, families, filteredIds);
  }, [isLazyMode, persons, families, filteredIds]);

  const visibleOnlyLayout = useMemo(() => {
    if (isLazyMode) return null;
    if (effectiveDisplayIds.size === 0) return null;
    return computeLayout(persons, families, effectiveDisplayIds);
  }, [isLazyMode, persons, families, effectiveDisplayIds]);

  const layoutResult = fullLazyLayout ?? visibleOnlyLayout;
  const layoutNodes = layoutResult?.nodes ?? [];
  const layoutEdges = layoutResult?.edges ?? [];

  const layoutNodeById = useMemo(() => {
    const m = new Map<string, (typeof layoutNodes)[number]>();
    for (const n of layoutNodes) m.set(n.id, n);
    return m;
  }, [layoutNodes]);

  /** Bands only from people who are actually shown (not `hidden`) */
  const layoutNodesForBands = useMemo(() => {
    if (fullLazyLayout) {
      return layoutNodes.filter(n => effectiveDisplayIds.has(n.id));
    }
    return layoutNodes;
  }, [fullLazyLayout, layoutNodes, effectiveDisplayIds]);

  const rfPersonIds = useMemo(() => {
    if (fullLazyLayout) {
      return Array.from(filteredIds).sort((a, b) => a.localeCompare(b));
    }
    return layoutNodes.map(n => n.id);
  }, [fullLazyLayout, filteredIds, layoutNodes]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback(
    (id: string) => {
      if (pathMode) {
        if (pathPersonA === null) {
          setPathPersonA(id);
        } else if (pathPersonA === id) {
          setPathPersonA(null); // deselect first person
        } else {
          const path = findPathBFS(pathPersonA, id, persons, families);
          setPathResult(path);
          setPathPersonA(null);
          // keep pathMode open so user can search again
        }
        return;
      }
      onSelectPerson(id);
    },
    [pathMode, pathPersonA, onSelectPerson, persons, families]
  );

  // ── Generation band nodes ─────────────────────────────────────────────────
  const generationBandNodes: Node[] = useMemo(() => {
    const genYMap = new Map<number, number[]>();
    for (const node of layoutNodesForBands) {
      const gen = node.data.generation;
      if (gen === null) continue;
      if (!genYMap.has(gen)) genYMap.set(gen, []);
      genYMap.get(gen)!.push(node.y);
    }
    if (genYMap.size === 0) return [];

    const sortedGens = Array.from(genYMap.keys()).sort((a, b) => a - b);
    return sortedGens.map((gen, idx) => {
      const ys = genYMap.get(gen)!;
      const minY = Math.min(...ys);
      return {
        id: `gen-band-${gen}`,
        type: 'generationBand',
        position: { x: BAND_X_OFFSET, y: minY - 50 },
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: -1,
        data: {
          generation: gen,
          language,
          isEven: idx % 2 === 0,
          bandHeight: BAND_HEIGHT,
        },
      } as Node;
    });
  }, [layoutNodesForBands, language]);

  // ── ReactFlow nodes & edges ───────────────────────────────────────────────
  const personNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    for (const id of rfPersonIds) {
      const ln = layoutNodeById.get(id);
      const person = persons.get(id);
      if (!ln || !person) continue;

      const hidden = Boolean(fullLazyLayout && !effectiveDisplayIds.has(id));

      nodes.push({
        id,
        type: 'person',
        position: { x: ln.x, y: ln.y },
        hidden,
        data: {
          person,
          isRoot: id === rootPersonId,
          isSelected: id === selectedPersonId,
          onClick: handleNodeClick,
          language,
          onToggleCollapse: handleToggleCollapse,
          isCollapsed: collapsedIds.has(id),
          hasChildren: hasChildrenMap.get(id) ?? false,
          isOnPath: pathHighlightIds.has(id),
          isPathStart: id === pathPersonA,
          onFocusSubtree,
          descendantCount: descendantCountMap.get(id) ?? 0,
          hasLazyExpand: isLazyMode && hasHiddenRelatives(id),
          lazyHiddenCount: hiddenRelativeCount(id),
          onExpandBranch: handleExpandBranch,
        },
      });
    }
    return nodes;
  }, [
    rfPersonIds,
    layoutNodeById,
    persons,
    fullLazyLayout,
    effectiveDisplayIds,
    rootPersonId,
    selectedPersonId,
    handleNodeClick,
    language,
    handleToggleCollapse,
    collapsedIds,
    hasChildrenMap,
    pathHighlightIds,
    pathPersonA,
    onFocusSubtree,
    descendantCountMap,
    isLazyMode,
    hasHiddenRelatives,
    hiddenRelativeCount,
    handleExpandBranch,
  ]);

  const allNodes: Node[] = useMemo(
    () => [...generationBandNodes, ...personNodes],
    [generationBandNodes, personNodes]
  );

  const allEdges: Edge[] = useMemo(
    () =>
      layoutEdges.map(e => {
        const onPath = isPathHighlightedEdge(e, pathEdgePairs, families, effectiveDisplayIds);
        const isSpouse = e.type === 'spouse';
        const srcOk = effectiveDisplayIds.has(e.source);
        const tgtOk = effectiveDisplayIds.has(e.target);
        const hidden = Boolean(fullLazyLayout && (!srcOk || !tgtOk));
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          hidden,
          animated: isSpouse && !onPath && !hidden,
          style: {
            stroke: onPath ? '#f97316' : isSpouse ? '#ec4899' : '#94a3b8',
            strokeWidth: onPath ? 3 : isSpouse ? 2 : 1.5,
          },
        };
      }),
    [layoutEdges, pathEdgePairs, families, effectiveDisplayIds, fullLazyLayout]
  );

  const [, , onNodesChange] = useNodesState(allNodes);
  const [, , onEdgesChange] = useEdgesState(allEdges);

  // ── Path mode status label ────────────────────────────────────────────────
  const pathInstructions = pathMode
    ? pathPersonA === null
      ? t ? 'בחר אדם ראשון' : 'Click first person'
      : t
        ? `✓ ${persons.get(pathPersonA)?.fullName ?? pathPersonA} — כעת בחר אדם שני`
        : `✓ ${persons.get(pathPersonA)?.fullName ?? pathPersonA} — now click second person`
    : null;

  const pathFoundText = pathResult !== null && !pathMode
    ? pathResult.length > 0
      ? t ? `נתיב: ${pathResult.length - 1} צעדים` : `Path: ${pathResult.length - 1} step(s)`
      : t ? 'לא נמצא נתיב' : 'No path found'
    : pathResult !== null && pathMode
      ? pathResult.length > 0
        ? t ? `נתיב אחרון: ${pathResult.length - 1} צעדים` : `Last: ${pathResult.length - 1} step(s)`
        : t ? 'לא נמצא נתיב' : 'No path found'
      : null;

  return (
    // dir="ltr" is intentional: ReactFlow canvas coordinate system is always LTR.
    // RTL is handled per-node inside PersonNode (dir="ltr" on card, Hebrew text renders fine).
    <div className="w-full h-full" dir="ltr" style={{ touchAction: 'none' }}>
      <ReactFlow
        nodes={allNodes}
        edges={allEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, includeHiddenNodes: false }}
        minZoom={0.03}   /* allow zooming out further on mobile */
        maxZoom={2.5}
        zoomOnPinch      /* pinch-to-zoom on mobile */
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        preventScrolling
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={node => {
            const person = node.data?.person as Person | undefined;
            if (!person) return 'transparent';
            return person.sex === 'F' ? '#f9a8d4' : person.sex === 'M' ? '#93c5fd' : '#cbd5e1';
          }}
          pannable
          zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />

        {isLazyMode && (
          <Panel position="top-left">
            <div
              className="max-w-[220px] rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 text-[11px] leading-snug text-slate-600 shadow-md backdrop-blur-sm transition-opacity duration-300"
              dir={t ? 'rtl' : 'ltr'}
            >
              {t
                ? 'עץ גדול: Dagre פעם אחת לכל הסינון; מוצגים שורש ו־2 דורות הורים/ילדים. לחץ + כדי לחשוף קרובים (מבטל hidden).'
                : 'Large tree: one layout for the full filter; root ±2 ancestor/descendant gens shown. + reveals relatives (toggles hidden).'}
            </div>
          </Panel>
        )}

        {/* Path-find toolbar */}
        <Panel position="top-right">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 290 }}>

            {/* Main toggle button */}
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'background 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                backgroundColor: pathMode ? '#ea580c' : '#ffffff',
                color: pathMode ? '#ffffff' : '#374151',
                outline: pathMode ? 'none' : '1px solid #e5e7eb',
              }}
              onClick={togglePathMode}
              title={t ? 'בחר שני אנשים כדי לבדוק מה הקשר ביניהם' : 'Select two people to see how they are related'}
            >
              {pathMode ? <X size={13} /> : <RouteIcon size={13} />}
              {pathMode
                ? (t ? 'בטל' : 'Cancel')
                : (t ? 'בדוק קשר בין אנשים' : 'Check relationship')}
            </button>

            {/* Hint shown when idle */}
            {!pathMode && pathResult === null && (
              <div style={{
                fontSize: 10, color: '#6b7280', textAlign: 'right',
                padding: '3px 6px', lineHeight: 1.5,
              }}>
                {t
                  ? 'לחץ כדי לגלות כיצד שני אנשים קשורים'
                  : 'Click to discover how two people are related'}
              </div>
            )}

            {/* Instructions while selecting */}
            {pathInstructions && (
              <div style={{
                backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '6px 10px',
                fontSize: 11, color: '#1e40af',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                width: '100%',
              }}>
                {pathInstructions}
              </div>
            )}

            {/* Result panel */}
            {pathResult !== null && (
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '8px 10px',
                fontSize: 11, color: '#374151',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                width: '100%',
              }}>
                {/* Result header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: pathResult.length > 0 ? 6 : 0 }}>
                  {pathResult.length > 0
                    ? <CheckCircle size={12} color="#16a34a" />
                    : <AlertCircle size={12} color="#dc2626" />}
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {pathFoundText}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {/* Search again button */}
                    <button
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 5, cursor: 'pointer',
                        padding: '2px 6px', color: '#15803d', fontSize: 10, fontWeight: 600,
                      }}
                      onClick={() => {
                        setPathResult(null);
                        setPathPersonA(null);
                        setPathMode(true);
                      }}
                      title={t ? 'חיפוש חדש' : 'New search'}
                    >
                      <RefreshCw size={10} />
                      {t ? 'חדש' : 'New'}
                    </button>
                    {/* Clear button */}
                    <button
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 2, color: '#9ca3af',
                      }}
                      onClick={() => { setPathResult(null); setPathMode(false); }}
                      title={t ? 'נקה הדגשה' : 'Clear highlight'}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Scrollable path list */}
                {pathResult.length > 0 && (
                  <ol style={{
                    margin: 0, padding: '0 0 0 16px',
                    maxHeight: 200, overflowY: 'auto',
                    listStyle: 'decimal',
                    fontSize: 10.5, color: '#374151',
                    lineHeight: 1.7,
                  }}>
                    {pathResult.map((personId, idx) => {
                      const p = persons.get(personId);
                      const life = p ? formatPersonLifespanLine(p) : null;
                      return (
                        <li key={personId} style={{
                          paddingLeft: 2,
                          fontWeight: idx === 0 || idx === pathResult.length - 1 ? 700 : 400,
                          color: idx === 0 || idx === pathResult.length - 1 ? '#111827' : '#374151',
                        }}>
                          {p?.fullName ?? personId}
                          {life ? (
                            <span style={{ color: '#9ca3af', marginLeft: 4 }} dir="ltr">
                              {life}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
