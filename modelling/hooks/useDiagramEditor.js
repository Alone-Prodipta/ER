import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addEdge, MarkerType, useEdgesState, useNodesState } from '@xyflow/react';
import TableNode from '../components/TableNode';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL
  || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const LAST_DIAGRAM_KEY = 'er-modeller:last-diagram-id';
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

function attachTableActions(savedNodes, actions) {
  return savedNodes.map((node) => ({
    ...node,
    data: { ...node.data, columns: Array.isArray(node.data?.columns) ? node.data.columns : [], ...actions },
  }));
}

export default function useDiagramEditor(onUnauthorized) {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [diagramId, setDiagramId] = useState(null);
  const diagramIdRef = useRef(null);
  const [title, setTitle] = useState('Untitled ER Diagram');
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [diagrams, setDiagrams] = useState([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [editVersion, setEditVersion] = useState(0);
  const editVersionRef = useRef(0);
  const saveQueueRef = useRef(Promise.resolve());
  const saveDiagramRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('Opening your diagram…');

  const markDirty = useCallback(() => {
    editVersionRef.current += 1;
    setEditVersion(editVersionRef.current);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  }, []);

  const updateTableName = useCallback((nodeId, newName) => {
    setNodes((current) => current.map((node) => node.id === nodeId
      ? { ...node, data: { ...node.data, label: newName } }
      : node));
    markDirty();
  }, [markDirty, setNodes]);

  const addColumn = useCallback((nodeId, colName, colType) => {
    setNodes((current) => current.map((node) => node.id === nodeId
      ? { ...node, data: { ...node.data, columns: [...(node.data.columns || []), { name: colName, type: colType }] } }
      : node));
    markDirty();
  }, [markDirty, setNodes]);

  const deleteColumn = useCallback((nodeId, colIndex) => {
    setNodes((current) => current.map((node) => node.id === nodeId
      ? { ...node, data: { ...node.data, columns: node.data.columns.filter((_, index) => index !== colIndex) } }
      : node));
    markDirty();
  }, [markDirty, setNodes]);

  const tableActions = useMemo(
    () => ({ updateTableName, addColumn, deleteColumn }),
    [updateTableName, addColumn, deleteColumn],
  );

  const refreshDiagramList = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/api/diagrams?limit=100`, { credentials: 'include' });
    if (response.status === 401) onUnauthorized();
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Could not load saved diagrams.');
    setDiagrams(data.diagrams);
    return data.diagrams;
  }, [onUnauthorized]);

  const applyDiagram = useCallback((diagram) => {
    diagramIdRef.current = diagram._id;
    setDiagramId(diagram._id);
    localStorage.setItem(LAST_DIAGRAM_KEY, diagram._id);
    setTitle(diagram.title || 'Untitled ER Diagram');
    setNodes(attachTableActions(diagram.nodes || [], tableActions));
    setEdges(diagram.edges || []);
    setViewport(diagram.viewport || DEFAULT_VIEWPORT);
    setIsDirty(false);
    setSaveStatus('Saved');
  }, [setEdges, setNodes, tableActions]);

  const loadDiagram = useCallback(async (id) => {
    if (isDirty && saveDiagramRef.current && !(await saveDiagramRef.current())) return;
    setIsDirty(false);
    setSaveStatus('Opening diagram…');
    try {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/${id}`, { credentials: 'include' });
      if (response.status === 401) onUnauthorized();
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not open this diagram.');
      applyDiagram(data.diagram);
    } catch (error) {
      setSaveStatus(error.message || 'Could not connect to the backend.');
    }
  }, [applyDiagram, isDirty, onUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    async function restoreLastDiagram() {
      try {
        const savedDiagrams = await refreshDiagramList();
        if (cancelled) return;
        const rememberedId = localStorage.getItem(LAST_DIAGRAM_KEY);
        const diagramToOpen = savedDiagrams.find((diagram) => diagram._id === rememberedId) || savedDiagrams[0];
        if (diagramToOpen) await loadDiagram(diagramToOpen._id);
        else setSaveStatus('Ready');
      } catch (error) {
        if (!cancelled) setSaveStatus(error.message || 'MongoDB is not connected.');
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    }
    restoreLastDiagram();
    return () => { cancelled = true; };
  }, [loadDiagram, refreshDiagramList]);

  const saveDiagram = useCallback(async () => {
    const savedVersion = editVersionRef.current;
    setSaveStatus('Saving…');
    const saveJob = saveQueueRef.current.catch(() => {}).then(async () => {
      const response = await fetch(`${API_BASE_URL}/api/diagrams/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: diagramIdRef.current,
          title: title.trim() || 'Untitled ER Diagram',
          nodes,
          edges,
          viewport,
        }),
      });
      if (response.status === 401) onUnauthorized();
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save the diagram.');
      diagramIdRef.current = data.diagram._id;
      localStorage.setItem(LAST_DIAGRAM_KEY, data.diagram._id);
      setDiagramId(data.diagram._id);
      return data.diagram;
    });
    saveQueueRef.current = saveJob;

    try {
      const diagram = await saveJob;
      if (savedVersion === editVersionRef.current) {
        setIsDirty(false);
        setSaveStatus('Saved');
      }
      setDiagrams((current) => [diagram, ...current.filter((item) => item._id !== diagram._id)]);
      return true;
    } catch (error) {
      setSaveStatus(error.message || 'Save failed. Check that the backend and MongoDB are running.');
      return false;
    }
  }, [edges, nodes, onUnauthorized, title, viewport]);

  useEffect(() => {
    saveDiagramRef.current = saveDiagram;
  }, [saveDiagram]);

  useEffect(() => {
    if (!isDirty || isRestoring) return undefined;
    const timeout = window.setTimeout(saveDiagram, 800);
    return () => window.clearTimeout(timeout);
  }, [editVersion, isDirty, isRestoring, saveDiagram]);

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    if (changes.some((change) => change.type !== 'select' && change.type !== 'dimensions')) markDirty();
  }, [markDirty, onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    if (changes.some((change) => change.type !== 'select')) markDirty();
  }, [markDirty, onEdgesChange]);

  const onConnect = useCallback((connection) => {
    setEdges((current) => addEdge({
      ...connection,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'white' },
      style: { strokeWidth: 2, stroke: 'white' },
    }, current));
    markDirty();
  }, [markDirty, setEdges]);

  const addTable = useCallback(() => {
    if (isRestoring) return;
    const tableNumber = nodes.length + 1;
    setNodes((current) => [...current, {
      id: `table-${Date.now()}`,
      type: 'tableNode',
      position: { x: 100 + nodes.length * 40, y: 100 + nodes.length * 40 },
      data: {
        label: `table_${tableNumber}`,
        columns: [{ name: 'id', type: 'INT' }, { name: 'created_at', type: 'TIMESTAMP' }],
        ...tableActions,
      },
    }]);
    markDirty();
  }, [isRestoring, markDirty, nodes.length, setNodes, tableActions]);

  const startNewDiagram = useCallback(async () => {
    if (isRestoring || (isDirty && !(await saveDiagram()))) return;
    diagramIdRef.current = null;
    localStorage.removeItem(LAST_DIAGRAM_KEY);
    setDiagramId(null);
    setTitle('Untitled ER Diagram');
    setNodes([]);
    setEdges([]);
    setViewport(DEFAULT_VIEWPORT);
    setIsDirty(false);
    setSaveStatus('New diagram');
  }, [isDirty, isRestoring, saveDiagram, setEdges, setNodes]);

  const renameDiagram = useCallback((nextTitle) => {
    setTitle(nextTitle);
    markDirty();
  }, [markDirty]);

  const handleMoveEnd = useCallback((_event, nextViewport) => {
    setViewport(nextViewport);
    markDirty();
  }, [markDirty]);

  return {
    nodes, edges, diagramId, title, viewport, diagrams, isRestoring, isDirty, saveStatus,
    nodeTypes, handleNodesChange, handleEdgesChange, onConnect, addTable, startNewDiagram,
    renameDiagram, loadDiagram, saveDiagram, handleMoveEnd, handleViewportChange: setViewport,
  };
}
