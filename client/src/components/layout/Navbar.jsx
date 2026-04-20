import { Moon, Sun } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const theme = useContext(ThemeContext);
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur-glass">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-brand-primary text-lg">Clearance System</Link>

          {!auth?.isAuthed && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
              <Link to="/how-it-works" className="hover:text-brand-primary transition-colors">How it Works</Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
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
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

