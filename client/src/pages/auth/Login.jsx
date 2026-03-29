import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      auth.setSession({ token: data.token, user: data.user });
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Login failed");
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
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Access your clearance dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="********"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-amber-50 text-amber-900 px-3 py-2 text-sm">{error}</div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-brand-primary text-white py-2 font-medium hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-brand-primary hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="text-brand-primary hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

