export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 backdrop-blur-glass">
      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
        © {new Date().getFullYear()} Student Clearance System
      </div>
    </footer>
  );
}

