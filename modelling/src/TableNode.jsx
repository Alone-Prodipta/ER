import React from 'react';
import { Handle, Position } from '@xyflow/react';

export function TableNode({ data }) {
  return (
    <div className="bg-slate-800 text-white rounded-lg border border-slate-600 min-w-55 shadow-xl overflow-hidden">
      {/* Table Title Header */}
      <div className="bg-slate-900 px-3 py-2 font-bold text-sm border-b border-slate-700 text-slate-200">
        {data.label}
      </div>

      {/* List of Columns */}
      <ul className="p-0 m-0 list-none">
        {data.columns.map((col, index) => (
          <li
            key={index}
            className="relative flex items-center justify-between px-3 py-1.5 text-xs border-b border-slate-700/50 hover:bg-slate-700/40"
          >
            {/* Connector dots for row-to-row connections */}
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${col.name}`}
              className="bg-indigo-400! w-2.5! h-2.5! -left-1.5!"
            />
            
            <span className="font-medium text-slate-200">{col.name}</span>
            <span className="text-slate-400 font-mono text-[10px] uppercase ml-3">
              {col.type}
            </span>

            <Handle
              type="source"
              position={Position.Right}
              id={`out-${col.name}`}
              className="bg-indigo-400! w-2.5! h-2.5! -right-1.5!"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}