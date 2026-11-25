import { Handle, Position } from '@xyflow/react';

export default function ColumnRow({ column, onDelete }) {
  return (
    <li className="group relative flex items-center justify-between border-b border-slate-700/50 px-3 py-1.5 text-xs hover:bg-slate-700/40">
      <Handle type="target" position={Position.Left} id={`in-${column.name}`} style={{ width: 10, height: '100%', top: 0, left: 0, transform: 'none', opacity: 0, zIndex: 10 }} />
      <span className="font-medium text-slate-200">{column.name}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-slate-400">{column.type}</span>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onDelete(); }}
          aria-label={`Delete ${column.name}`}
          title="Delete field"
          className="cursor-pointer px-1 text-slate-400 transition hover:text-red-400"
        >×</button>
      </div>
      <Handle type="source" position={Position.Right} id={`out-${column.name}`} style={{ width: 10, height: '100%', top: 0, right: 0, transform: 'none', opacity: 0, zIndex: 10 }} />
    </li>
  );
}
