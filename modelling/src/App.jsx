import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';

export default function App() {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [diagramId, setDiagramId] = useState(null);
  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: "white",
            },
            style: {
              strokeWidth: 2,
              stroke: "white",
            },
          },
          eds
        )
      ),
    [setEdges]
  );
  const updateTableName = useCallback((nodeId, newName) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label: newName },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addColumn = useCallback((nodeId, colName, colType) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              columns: [...node.data.columns, { name: colName, type: colType }],
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const deleteColumn = useCallback((nodeId, colIndex) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              columns: node.data.columns.filter((_, idx) => idx !== colIndex),
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addTable = () => {
    const tableIndex = nodes.length + 1;
    const nodeId = `table_${tableIndex}`;

    const newNode = {
      id: nodeId,
      type: 'tableNode',
      position: { x: 100 + nodes.length * 40, y: 100 + nodes.length * 40 },
      data: {
        label: `table_${tableIndex}`,
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
        updateTableName,
        addColumn,
        deleteColumn,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  const saveDiagram = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diagrams/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: diagramId,
          title: 'My Database ERD',
          nodes,
          edges,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDiagramId(data.diagram._id);
        alert(` Saved successfully! Diagram ID: ${data.diagram._id}`);
      } else {
        alert(` Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert(' Failed to connect to server');
    }
  };
  return (
    <div className="w-screen h-screen relative bg-slate-950">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={addTable}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition cursor-pointer"
        >
          + Add Table
        </button>
        <button
          onClick={saveDiagram}
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition cursor-pointer ml-2"
        >
          Save Diagram
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
      >
        <Background color="#334155" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}