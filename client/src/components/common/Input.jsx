export default function Input({ label, error, className = "", ...props }) {
  return (
    <div>
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <input
        className={[
          "mt-1 w-full rounded-xl border bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary",
          error ? "border-red-400" : "border-slate-200 dark:border-slate-700",
          className
        ].join(" ")}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

