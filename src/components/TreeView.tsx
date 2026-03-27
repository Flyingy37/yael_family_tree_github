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
import '@xyflow/react/dist/style.css';
import { PersonNode } from './PersonNode';
import { GenerationBandNode } from './GenerationBandNode';
import { computeLayout, NODE_HEIGHT } from '../utils/layout';
import { getDescendantIds, findPathBFS } from '../utils/treeHelpers';
import type { Person, Family } from '../types';

const BAND_HEIGHT = NODE_HEIGHT + 100; // node height + ranksep gap
const BAND_X_OFFSET = -5000;           // far left so band spans full viewport

const nodeTypes = {
  person: PersonNode,
  generationBand: GenerationBandNode,
};

interface Props {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  filteredIds: Set<string>;
  rootPersonId: string;
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

export function TreeView({
  persons,
  families,
  filteredIds,
  rootPersonId,
  selectedPersonId,
  onSelectPerson,
  language = 'en',
}: Props) {
  const { fitView } = useReactFlow();
  const t = language === 'he';

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

  // Effective display IDs: filteredIds minus descendants of collapsed nodes
  const effectiveDisplayIds = useMemo(() => {
    if (collapsedIds.size === 0) return filteredIds;
    const result = new Set(filteredIds);
    for (const cId of collapsedIds) {
      if (!result.has(cId)) continue;
      const descendants = getDescendantIds(cId, persons, families);
      for (const dId of descendants) result.delete(dId);
    }
    return result;
  }, [filteredIds, collapsedIds, persons, families]);

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
  const { layoutNodes, layoutEdges } = useMemo(() => {
    const result = computeLayout(persons, families, effectiveDisplayIds);
    return { layoutNodes: result.nodes, layoutEdges: result.edges };
  }, [persons, families, effectiveDisplayIds]);

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
          setPathMode(false);
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
    for (const node of layoutNodes) {
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
  }, [layoutNodes, language]);

  // ── ReactFlow nodes & edges ───────────────────────────────────────────────
  const personNodes: Node[] = useMemo(
    () =>
      layoutNodes.map(n => ({
        id: n.id,
        type: 'person',
        position: { x: n.x, y: n.y },
        data: {
          person: n.data,
          isRoot: n.id === rootPersonId,
          isSelected: n.id === selectedPersonId,
          onClick: handleNodeClick,
          language,
          onToggleCollapse: handleToggleCollapse,
          isCollapsed: collapsedIds.has(n.id),
          hasChildren: hasChildrenMap.get(n.id) ?? false,
          isOnPath: pathHighlightIds.has(n.id),
        },
      })),
    [
      layoutNodes,
      rootPersonId,
      selectedPersonId,
      handleNodeClick,
      language,
      handleToggleCollapse,
      collapsedIds,
      hasChildrenMap,
      pathHighlightIds,
    ]
  );

  const allNodes: Node[] = useMemo(
    () => [...generationBandNodes, ...personNodes],
    [generationBandNodes, personNodes]
  );

  const allEdges: Edge[] = useMemo(
    () =>
      layoutEdges.map(e => {
        const onPath = pathEdgePairs.has(`${e.source}:${e.target}`);
        const isSpouse = e.type === 'spouse';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: isSpouse && !onPath,
          style: {
            stroke: onPath ? '#f97316' : isSpouse ? '#ec4899' : '#94a3b8',
            strokeWidth: onPath ? 3 : isSpouse ? 2 : 1.5,
          },
        };
      }),
    [layoutEdges, pathEdgePairs]
  );

  const [, , onNodesChange] = useNodesState(allNodes);
  const [, , onEdgesChange] = useEdgesState(allEdges);

  // ── Path mode status label ────────────────────────────────────────────────
  const pathStatusText = pathMode
    ? pathPersonA === null
      ? t ? 'בחר אדם ראשון' : 'Select first person'
      : t
        ? `נבחר: ${persons.get(pathPersonA)?.fullName ?? pathPersonA} — בחר אדם שני`
        : `Selected: ${persons.get(pathPersonA)?.fullName ?? pathPersonA} — select second person`
    : pathResult !== null
      ? pathResult.length > 0
        ? t ? `נתיב: ${pathResult.length - 1} צעדים` : `Path: ${pathResult.length - 1} step(s)`
        : t ? 'לא נמצא נתיב' : 'No path found'
      : null;

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={allNodes}
        edges={allEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
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

        {/* Path-find toolbar */}
        <Panel position="top-right">
          <div className="flex flex-col items-end gap-1">
            <button
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors
                ${pathMode
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}
              `}
              onClick={togglePathMode}
              title={t ? 'מצא את הנתיב הקצר ביותר בין שני אנשים' : 'Find shortest path between two people'}
            >
              {pathMode
                ? (t ? '✕ בטל' : '✕ Cancel')
                : (t ? '⟷ מצא נתיב' : '⟷ Find Path')}
            </button>

            {pathStatusText && (
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 shadow max-w-xs text-right">
                {pathStatusText}
                {!pathMode && pathResult !== null && (
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setPathResult(null)}
                    title={t ? 'נקה הדגשה' : 'Clear highlight'}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
