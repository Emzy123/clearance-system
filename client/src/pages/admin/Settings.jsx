import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { getSettings, updateSettings } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";

const WELCOME_KEY = "email.welcome.html";
const RESET_KEY = "email.password_reset.html";
const PORTAL_KEY = "portal.clearance.enabled";

export default function Settings() {
  const { token } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("welcome");
  const [welcomeHtml, setWelcomeHtml] = useState(
    '<div style="font-family:Inter,Arial,sans-serif"><h2>Welcome, {{name}}</h2><p>Your account is ready.</p></div>'
  );
  const [resetHtml, setResetHtml] = useState(
    '<div style="font-family:Inter,Arial,sans-serif"><p>Reset your password:</p><p><a href="{{resetUrl}}">{{resetUrl}}</a></p></div>'
  );
  const [portalEnabled, setPortalEnabled] = useState(true);

  useQuery({
    queryKey: ["admin-settings-templates"],
    queryFn: () => getSettings(token, [WELCOME_KEY, RESET_KEY, PORTAL_KEY]),
    enabled: Boolean(token),
    onSuccess: (data) => {
      for (const item of data.items || []) {
        if (item.key === WELCOME_KEY && typeof item.value === "string") setWelcomeHtml(item.value);
        if (item.key === RESET_KEY && typeof item.value === "string") setResetHtml(item.value);
        if (item.key === PORTAL_KEY) setPortalEnabled(item.value !== false);
      }
    }
  });

  const m = useMutation({
    mutationFn: () =>
      updateSettings(token, {
        [WELCOME_KEY]: welcomeHtml,
        [RESET_KEY]: resetHtml
      }),
    onSuccess: () => toast.push({ type: "success", message: "Settings saved" }),
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });
  const portalM = useMutation({
    mutationFn: (nextValue) =>
      updateSettings(token, {
        [PORTAL_KEY]: nextValue
      }),
    onSuccess: (_, nextValue) => {
      setPortalEnabled(nextValue);
      toast.push({
        type: "success",
        message: nextValue ? "Clearance portal activated" : "Clearance portal stopped"
      });
    },
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });

  const activeHtml = tab === "welcome" ? welcomeHtml : resetHtml;
  const activeVariable = tab === "welcome" ? "{{name}}" : "{{resetUrl}}";
  const activeTitle = tab === "welcome" ? "Welcome email template" : "Password reset template";
  const setActiveHtml = tab === "welcome" ? setWelcomeHtml : setResetHtml;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Configure notification templates with live preview.
        </p>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Clearance Portal</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Control whether students can initiate and submit clearance documents.
            </p>
            <p className="mt-1 text-xs">
              Status:{" "}
              <span className={portalEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                {portalEnabled ? "Active" : "Stopped"}
              </span>
            </p>
          </div>
          <Button
            variant={portalEnabled ? "danger" : "primary"}
            onClick={() => portalM.mutate(!portalEnabled)}
            disabled={portalM.isPending}
          >
            {portalM.isPending
              ? "Updating..."
              : portalEnabled
                ? "Stop clearance portal"
                : "Activate clearance portal"}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Button variant={tab === "welcome" ? "primary" : "ghost"} onClick={() => setTab("welcome")}>
            Welcome
          </Button>
          <Button variant={tab === "reset" ? "primary" : "ghost"} onClick={() => setTab("reset")}>
            Password reset
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">{activeTitle}</div>
            <textarea
              className="w-full min-h-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-secondary"
              value={activeHtml}
              onChange={(e) => setActiveHtml(e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Variables: <code>{activeVariable}</code>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Preview</div>
            <div className="min-h-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-auto">
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: activeHtml
                    .replaceAll("{{name}}", "Jane Doe")
                    .replaceAll("{{resetUrl}}", "https://example.com/reset/abc123")
                }}
              />
            </div>
            <div className="mt-4">
              <Button onClick={() => m.mutate()} disabled={m.isPending}>
                {m.isPending ? "Saving..." : "Save templates"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

