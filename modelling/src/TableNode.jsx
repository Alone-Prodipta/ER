import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export function TableNode({ id, data }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(data.label);

  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('VARCHAR');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (titleInput.trim() && data.updateTableName) {
      data.updateTableName(id, titleInput.trim());
    }
    setIsEditingTitle(false); // FIXED: Close title edit mode
  };

  const handleAddColumn = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (newColName.trim() && data.addColumn) {
      data.addColumn(id, newColName.trim(), newColType);
      setNewColName('');
      setShowAddForm(false); // FIXED: Close add column form
    }
  };

  return (
    <div className="bg-slate-800 text-white rounded-lg border border-slate-600 min-w-64 shadow-xl">
      {/* Table Title Header */}
      <div className="bg-slate-900 px-3 py-2 border-b border-slate-700 rounded-t-lg flex items-center justify-between">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="w-full bg-slate-950 text-white font-bold text-sm px-1 py-0.5 rounded border border-indigo-500 outline-none nodrag"
            />
          </form>
        ) : (
          <span
            onClick={() => setIsEditingTitle(true)}
            className="font-bold text-sm text-slate-200 hover:text-indigo-300 cursor-pointer transition w-full"
            title="Click to rename"
          >
            {data.label}
          </span>
        )}
      </div>

      {/* List of Columns */}
      <ul className="p-0 m-0 list-none">
        {data.columns.map((col, index) => (
          <li
            key={index}
            className="group relative flex items-center justify-between px-3 py-1.5 text-xs border-b border-slate-700/50 hover:bg-slate-700/40"
          >
            {/* Target Handle (Left) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`in-${col.name}`}
              style={{
                width: '10px',
                height: '100%',
                top: 0,
                left: '0px',
                transform: 'none',
                opacity: 0,
                zIndex: 10,
              }}
            />

            <span className="font-medium text-slate-200">{col.name}</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[10px] uppercase">
                {col.type}
              </span>

              {/* Delete Button */}
              {data.deleteColumn && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.deleteColumn(id, index);
                  }}
                  className="opacity-1 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition px-1 cursor-pointer flex items-center justify-center"
                  title="Delete column"
                  style={{ fontSize: '10px'}}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Source Handle (Right) */}
            <Handle
              type="source"
              position={Position.Right}
              id={`out-${col.name}`}
              style={{
                width: '10px',
                height: '100%',
                top: 0,
                right: '0px',
                transform: 'none',
                opacity: 0,
                zIndex: 10,
              }}
            />
          </li>
        ))}
      </ul>

      {/* Add Column Footer */}
      <div className="p-2 bg-slate-850 rounded-b-lg">
        {showAddForm ? (
          <form onSubmit={handleAddColumn} className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Column name"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              autoFocus
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 nodrag"
            />
            <div className="flex gap-1">
              <select
                value={newColType}
                onChange={(e) => setNewColType(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded px-1.5 py-1 text-xs text-slate-300 outline-none flex-1 nodrag"
              >
                <option value="VARCHAR">VARCHAR</option>
                <option value="INT">INT</option>
                <option value="BIGINT">BIGINT</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="TIMESTAMP">TIMESTAMP</option>
                <option value="TEXT">TEXT</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs font-semibold transition cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddForm(false);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(true);
            }}
            className="w-full text-left text-xs text-slate-400 hover:text-indigo-400 font-medium px-1 py-0.5 rounded transition cursor-pointer"
          >
            + Add Field
          </button>
        )}
      </div>
    </div>
  );
}