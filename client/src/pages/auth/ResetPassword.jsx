import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Reset failed");
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
        <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Choose a strong new password.
        </p>

        {done ? (
          <div className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-3 text-sm">
            Password updated successfully. You can now sign in.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">New password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
              />
            </div>

            {error ? (
              <div className="rounded-xl bg-amber-50 text-amber-900 px-3 py-2 text-sm">{error}</div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-brand-primary text-white py-2 font-medium hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <div className="text-sm mt-4">
          <Link to="/login" className="text-brand-primary hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

