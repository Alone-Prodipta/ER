import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';

export default function App() {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addTable = () => {
    const tableIndex = nodes.length + 1;
    const newNode = {
      id: `table_${tableIndex}`,
      type: 'tableNode',
      position: { x: 100 + nodes.length * 40, y: 100 + nodes.length * 40 },
      data: {
        label: `table_${tableIndex}`,
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-screen h-screen relative bg-slate-950">
      {/* Top Action Bar */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={addTable}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
        >
          + Add Table
        </button>
      </div>

      {/* Main Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
      >
        <Background color="#334155" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}