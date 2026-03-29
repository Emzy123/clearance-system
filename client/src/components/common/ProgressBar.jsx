export default function ProgressBar({ value = 0, colorClass = "bg-brand-secondary" }) {
  return (
    <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
      <div className={`h-2 ${colorClass} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
