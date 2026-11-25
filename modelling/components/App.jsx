import useDiagramEditor from '../hooks/useDiagramEditor';
import DiagramCanvas from './DiagramCanvas';
import DiagramToolbar from './DiagramToolbar';

export default function App() {
  const editor = useDiagramEditor();

  return (
    <main className="relative h-screen w-screen bg-slate-950">
      <DiagramToolbar
        title={editor.title}
        diagrams={editor.diagrams}
        diagramId={editor.diagramId}
        saveStatus={editor.saveStatus}
        isDirty={editor.isDirty}
        isRestoring={editor.isRestoring}
        onTitleChange={editor.renameDiagram}
        onAddTable={editor.addTable}
        onNewDiagram={editor.startNewDiagram}
        onSelectDiagram={editor.loadDiagram}
        onSave={editor.saveDiagram}
      />
      <DiagramCanvas
        nodes={editor.nodes}
        edges={editor.edges}
        viewport={editor.viewport}
        nodeTypes={editor.nodeTypes}
        isRestoring={editor.isRestoring}
        onNodesChange={editor.handleNodesChange}
        onEdgesChange={editor.handleEdgesChange}
        onConnect={editor.onConnect}
        onViewportChange={editor.handleViewportChange}
        onMoveEnd={editor.handleMoveEnd}
      />
    </main>
  );
}
