import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Request failed");
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
        <h1 className="text-2xl font-semibold mb-2">Forgot password</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          We’ll email you a reset link if the account exists.
        </p>

        {sent ? (
          <div className="rounded-xl bg-emerald-50 text-emerald-900 px-3 py-3 text-sm">
            If your email exists in the system, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl bg-amber-50 text-amber-900 px-3 py-2 text-sm">{error}</div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-brand-primary text-white py-2 font-medium hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
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

