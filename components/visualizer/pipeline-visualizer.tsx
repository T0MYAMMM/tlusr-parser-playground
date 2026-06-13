'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PIPELINE_STAGES, STAGE_BY_ID, type StageMeta } from '@/lib/pipeline-stages';
import type { PipelineStageId } from '@/lib/types';

import { StageNode } from './stage-node';
import { StageDetailsPanel } from './stage-details-panel';

/** Horizontal swim-lane layout. Two rows give the 8 stages room to breathe. */
const COL_WIDTH = 260;
const ROW_HEIGHT = 150;
const ROWS = 2;

function computeLayout(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = PIPELINE_STAGES.map((meta, i) => {
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    return {
      id: meta.id,
      type: 'stage',
      position: { x: col * COL_WIDTH, y: row * ROW_HEIGHT },
      data: { meta, index: i },
      draggable: true,
    };
  });

  const edges: Edge[] = PIPELINE_STAGES.slice(1).map((meta, i) => ({
    id: `${PIPELINE_STAGES[i].id}->${meta.id}`,
    source: PIPELINE_STAGES[i].id,
    target: meta.id,
    type: 'smoothstep',
    animated: true,
    style: { strokeWidth: 1.4 },
  }));

  return { nodes, edges };
}

const NODE_TYPES = { stage: StageNode };

interface Props {
  initialStageId?: PipelineStageId;
}

export function PipelineVisualizer({ initialStageId }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(computeLayout, []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<StageMeta | null>(
    initialStageId ? STAGE_BY_ID[initialStageId] : null,
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const meta = STAGE_BY_ID[node.id as PipelineStageId];
    if (meta) setSelected(meta);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelected(null)}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.4}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          className="bg-transparent"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.07)"
          />
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!bg-zinc-950/70 !backdrop-blur-xl"
          />
          <MiniMap
            position="bottom-right"
            nodeColor={() => '#22d3ee'}
            nodeStrokeColor={() => 'transparent'}
            maskColor="rgba(10,10,12,0.7)"
            className="!rounded-lg !border !border-white/[0.08] !bg-zinc-950/70"
          />
        </ReactFlow>

        <StageDetailsPanel stage={selected} onClose={() => setSelected(null)} />

        {!selected && (
          <div className="pointer-events-none absolute left-3 top-3 max-w-[260px] rounded-md border border-white/[0.06] bg-zinc-950/70 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur">
            Click any stage to inspect the regex, tags, and modules used at that step.
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
