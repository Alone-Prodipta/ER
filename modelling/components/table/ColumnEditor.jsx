import { useState } from 'react';

const COLUMN_TYPES = ['VARCHAR', 'INT', 'BIGINT', 'BOOLEAN', 'TIMESTAMP', 'TEXT'];

export default function ColumnEditor({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('VARCHAR');

  const submit = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    onAdd(cleanName, type);
    setName('');
    onCancel();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-1.5 nodrag">
      <input
        autoFocus
        aria-label="Field name"
        placeholder="Field name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
      />
      <div className="flex gap-1">
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Field type" className="flex-1 rounded bg-slate-900 px-1.5 py-1 text-xs text-slate-300 outline-none">
          {COLUMN_TYPES.map((columnType) => <option key={columnType} value={columnType}>{columnType}</option>)}
        </select>
        <button type="submit" className="cursor-pointer rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500">Add</button>
        <button type="button" onClick={onCancel} className="cursor-pointer rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600">Cancel</button>
      </div>
    </form>
  );
}
