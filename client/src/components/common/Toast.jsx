import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const api = useMemo(
    () => ({
      push: (toast) => {
        const id = crypto.randomUUID();
        const t = { id, type: toast.type || "info", message: toast.message || "" };
        setItems((prev) => [t, ...prev].slice(0, 5));
        setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3500);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed z-50 right-4 top-4 space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "glass-card rounded-xl px-4 py-3 text-sm max-w-sm",
              t.type === "success" ? "border-l-4 border-emerald-500" : "",
              t.type === "error" ? "border-l-4 border-red-500" : "",
              t.type === "warning" ? "border-l-4 border-amber-500" : "",
              t.type === "info" ? "border-l-4 border-brand-secondary" : ""
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

