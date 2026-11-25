export default function AccountMenu({ email, onLogout, message }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-800 px-3 py-2">
      <span className="max-w-48 truncate text-xs text-slate-300" title={email}>{email}</span>
      <button type="button" onClick={onLogout} className="rounded bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-slate-600">Log out</button>
      {message && <span role="alert" className="text-xs text-red-300">{message}</span>}
    </div>
  );
}
