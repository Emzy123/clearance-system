import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-brand-secondary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Go to login
        </Link>
      </div>
    </section>
  );
}
