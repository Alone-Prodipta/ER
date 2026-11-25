import { useState } from 'react';

export default function TableNameEditor({ id, name, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name || 'table');

  const submit = (event) => {
    event?.preventDefault();
    const nextName = value.trim();
    if (nextName && nextName !== name) onRename?.(id, nextName);
    else setValue(name || 'table');
    setEditing(false);
  };

  return (
    <div className="flex items-center rounded border-b border-slate-700 bg-slate-900 px-3 py-2">
      {editing ? (
        <form onSubmit={submit} className="w-full">
          <input
            autoFocus
            aria-label="Table name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={submit}
            className="w-full rounded border border-indigo-500 bg-slate-950 px-1 py-0.5 text-sm font-bold text-white outline-none nodrag"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => { setValue(name || 'table'); setEditing(true); }}
          title="Click to rename table"
          className="w-full cursor-pointer text-left text-sm font-bold text-slate-200 transition hover:text-indigo-300"
        >
          {name || 'table'}
        </button>
      )}
    </div>
  );
}
