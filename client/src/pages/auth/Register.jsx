import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    matricNumber: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      auth.setSession({ token: data.token, user: data.user });
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-2xl p-6"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Student registration.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              required
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Matric number</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={form.matricNumber}
              onChange={(e) => setForm((f) => ({ ...f, matricNumber: e.target.value }))}
              required
              placeholder="MAT/2026/001"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              type="password"
              required
              placeholder="At least 8 characters"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-amber-50 text-amber-900 px-3 py-2 text-sm">{error}</div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-brand-primary text-white py-2 font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="text-sm text-center">
            <span className="text-slate-600 dark:text-slate-300">Already have an account?</span>{" "}
            <Link to="/login" className="text-brand-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

