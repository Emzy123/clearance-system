import { io } from "socket.io-client";

/** API origin (no /api suffix), aligned with VITE_API_URL */
export function getApiOrigin() {
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  if (typeof base === "string" && base.startsWith("/")) {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  return base.replace(/\/api\/?$/, "");
}

export function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || getApiOrigin();
}

export function getHealthUrl() {
  return `${getApiOrigin()}/api/health`;
}

export const defaultSocketOptions = {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000
};

const RETRY_MS = 5000;

/**
 * Opens a socket.io connection only after the API health check passes.
 * Avoids repeated WebSocket errors in the browser when the server is not running.
 * Retries on an interval until cleanup() or success.
 *
 * @param {{ setup?: (socket: import("socket.io-client").Socket) => void; handlers?: Record<string, Function> }} opts
 * @returns {() => void} cleanup
 */
export function connectSocketWhenHealthy({ setup, handlers = {} }) {
  let socket = null;
  let cancelled = false;
  let retryTimer = null;

  const cleanup = () => {
    cancelled = true;
    if (retryTimer != null) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const tryConnect = () => {
    fetch(getHealthUrl(), { method: "GET", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("unhealthy");
        return r.json();
      })
      .then(() => {
        if (cancelled) return;
        socket = io(getSocketUrl(), defaultSocketOptions);
        for (const [event, fn] of Object.entries(handlers)) {
          if (typeof fn === "function") socket.on(event, fn);
        }
        socket.on("connect", () => {
          setup?.(socket);
        });
      })
      .catch(() => {
        if (cancelled) return;
        retryTimer = setTimeout(tryConnect, RETRY_MS);
      });
  };

  tryConnect();
  return cleanup;
}
