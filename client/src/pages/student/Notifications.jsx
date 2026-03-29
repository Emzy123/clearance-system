import { useAuth } from "../../hooks/useAuth";
import { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { markNotificationRead } from "../../services/studentService";
import { useToast } from "../../components/common/Toast";

export default function Notifications() {
  const { token } = useAuth();
  const toast = useToast();
  const ctx = useContext(NotificationContext);

  async function onRead(id) {
    try {
      await markNotificationRead(token, id);
      ctx.setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" });
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your latest clearance updates.
          </p>
        </div>
        <div className="text-sm rounded-full px-3 py-1 bg-slate-100/70 dark:bg-slate-900/40">
          Unread: {ctx?.unreadCount ?? 0}
        </div>
      </div>

      <div className="space-y-3">
        {(ctx?.items || []).map((n) => (
          <Card key={n._id} className={n.read ? "opacity-80" : ""}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{n.message}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </div>
              </div>
              {!n.read ? (
                <Button variant="ghost" onClick={() => onRead(n._id)}>
                  Mark read
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
        {(!ctx?.items || ctx.items.length === 0) && (
          <Card>
            <div className="text-sm text-slate-600 dark:text-slate-300">No notifications yet.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

