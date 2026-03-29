import { Moon, Sun } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const theme = useContext(ThemeContext);
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur-glass">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-brand-primary">Clearance System</div>

        <div className="flex items-center gap-2">
          <button
            onClick={theme?.toggle}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 px-3 py-2 text-sm"
            aria-label="Toggle theme"
          >
            {theme?.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme?.theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          {auth?.isAuthed ? (
            <button
              onClick={auth.logout}
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 text-sm font-medium"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

