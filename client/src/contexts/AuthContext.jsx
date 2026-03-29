import React, { createContext, useEffect, useMemo, useState } from "react";
import { verifyToken } from "../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEY = "clearance.auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.token || null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await verifyToken(token);
        if (!cancelled) setUser(res.user);
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthed: Boolean(token && user),
      setSession: ({ token: newToken, user: newUser }) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken }));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

