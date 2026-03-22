import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './PersonNode';
import { computeLayout } from '../utils/layout';
import type { Person, Family } from '../types';

const nodeTypes = { person: PersonNode };

interface Props {
  persons: Map<string, Person>;
  families: Map<string, Family>;
  filteredIds: Set<string>;
  rootPersonId: string;
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
}

export function TreeView({ persons, families, filteredIds, rootPersonId, selectedPersonId, onSelectPerson }: Props) {
  const { fitView } = useReactFlow();

  const { layoutNodes, layoutEdges } = useMemo(() => {
    const result = computeLayout(persons, families, filteredIds);
    return { layoutNodes: result.nodes, layoutEdges: result.edges };
  }, [persons, families, filteredIds]);

  const handleNodeClick = useCallback((id: string) => {
    onSelectPerson(id);
  }, [onSelectPerson]);

  const initialNodes: Node[] = useMemo(() =>
    layoutNodes.map(n => ({
      id: n.id,
      type: 'person',
      position: { x: n.x, y: n.y },
      data: {
        person: n.data,
        isRoot: n.id === rootPersonId,
        isSelected: n.id === selectedPersonId,
        onClick: handleNodeClick,
      },
    })),
    [layoutNodes, rootPersonId, selectedPersonId, handleNodeClick]
  );

  const initialEdges: Edge[] = useMemo(() =>
    layoutEdges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: e.type === 'spouse',
      style: {
        stroke: e.type === 'spouse' ? '#ec4899' : '#94a3b8',
        strokeWidth: e.type === 'spouse' ? 2 : 1.5,
      },
    })),
    [layoutEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full" dir="ltr">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
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
            if (!person) return '#94a3b8';
            return person.sex === 'F' ? '#f9a8d4' : person.sex === 'M' ? '#93c5fd' : '#cbd5e1';
          }}
          pannable
          zoomable
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
