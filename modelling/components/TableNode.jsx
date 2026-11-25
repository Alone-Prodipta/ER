import { useState } from 'react';
import ColumnEditor from './table/ColumnEditor';
import ColumnRow from './table/ColumnRow';
import TableNameEditor from './table/TableNameEditor';

export default function TableNode({ id, data }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const columns = Array.isArray(data.columns) ? data.columns : [];

  return (
    <section className="min-w-64 rounded-lg border border-slate-600 bg-slate-800 text-white shadow-xl">
      <TableNameEditor id={id} name={data.label} onRename={data.updateTableName} />
      <ul className="m-0 list-none p-0">
        {columns.map((column, index) => (
          <ColumnRow key={`${column.name}-${index}`} column={column} onDelete={() => data.deleteColumn?.(id, index)} />
        ))}
      </ul>
      <div className="rounded-b-lg bg-slate-850 p-2">
        {showAddForm ? (
          <ColumnEditor onAdd={(name, type) => data.addColumn?.(id, name, type)} onCancel={() => setShowAddForm(false)} />
        ) : (
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); setShowAddForm(true); }}
            className="w-full cursor-pointer rounded px-1 py-0.5 text-left text-xs font-medium text-slate-400 transition hover:text-indigo-400 nodrag"
          >
            + Add Field
          </button>
        )}
      </div>
    </section>
  );
}
