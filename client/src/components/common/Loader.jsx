export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-secondary dark:border-slate-600 dark:border-t-brand-secondary" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

