export default function SaveStatus({ status }) {
  return (
    <span className="ml-auto max-w-full pb-2 text-xs text-slate-300" role="status" aria-live="polite">
      {status}
    </span>
  );
}
