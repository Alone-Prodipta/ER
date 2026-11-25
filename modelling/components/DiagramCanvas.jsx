import { Background, Controls, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function DiagramCanvas({
  nodes, edges, viewport, nodeTypes, isRestoring,
  onNodesChange, onEdgesChange, onConnect, onViewportChange, onMoveEnd,
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      viewport={viewport}
      nodeTypes={nodeTypes}
      nodesDraggable={!isRestoring}
      nodesConnectable={!isRestoring}
      elementsSelectable={!isRestoring}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onViewportChange={onViewportChange}
      onMoveEnd={onMoveEnd}
    >
      <Background color="#334155" gap={16} />
      <Controls />
    </ReactFlow>
  );
}
