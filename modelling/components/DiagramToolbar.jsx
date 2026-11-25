import SaveStatus from './SaveStatus';

export default function DiagramToolbar({
  title, diagrams, diagramId, saveStatus, isDirty, isRestoring,
  onTitleChange, onAddTable, onNewDiagram, onSelectDiagram, onSave,
}) {
  return (
    <header className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-end gap-2 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
      <button onClick={onAddTable} disabled={isRestoring} className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-default disabled:opacity-50">
        + Add Table
      </button>
      <button onClick={onNewDiagram} disabled={isRestoring} className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-600 disabled:cursor-default disabled:opacity-50">
        New Diagram
      </button>

      <label className="flex min-w-48 flex-col gap-1 text-xs font-medium text-slate-300">
        <input
          
          placeholder="Untitled ER Diagram"
          value={title}
          maxLength={120}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={isRestoring}
          className="w-56 rounded-md border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:opacity-50"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
        <select
          
          value={diagramId || ''}
          onChange={(event) => event.target.value && onSelectDiagram(event.target.value)}
          disabled={isRestoring}
          className="max-w-56 rounded-md border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">Open a saved diagram…</option>
          {diagrams.map((diagram) => <option key={diagram._id} value={diagram._id}>{diagram.title}</option>)}
        </select>
      </label>

      <button onClick={onSave} disabled={isRestoring || (!isDirty && Boolean(diagramId))} className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500 disabled:cursor-default disabled:opacity-50">
        Save Now
      </button>
      <SaveStatus status={isRestoring ? 'Opening your diagram…' : saveStatus} />
    </header>
  );
}
