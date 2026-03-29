import React, { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getNotifications } from "../services/studentService";
import { connectSocketWhenHealthy } from "../utils/socketClient";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token || !user) return;
      try {
        const res = await getNotifications(token);
        if (!cancelled) setItems(res.items);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return undefined;

    const refresh = () => {
      getNotifications(token)
        .then((res) => setItems(res.items))
        .catch(() => {});
    };

    return connectSocketWhenHealthy({
      setup: (socket) => socket.emit("join", { userId: user._id || user.id }),
      handlers: {
        "notification:new": refresh,
        sequential_approved: refresh,
        sequential_rejected: refresh,
        parallel_ready: refresh,
        parallel_submitted: refresh,
        parallel_approved: refresh,
        parallel_rejected: refresh,
        certificate_ready: refresh
      }
    });
  }, [token, user]);

  const value = useMemo(
    () => ({
      items,
      unreadCount: items.filter((n) => !n.read).length,
      setItems
    }),
    [items]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export { NotificationContext };

