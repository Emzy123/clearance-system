import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, Users, FileText } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navByRole = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/profile", label: "Profile", icon: Users },
    { to: "/student/notifications", label: "Notifications", icon: FileText }
  ],
  staff: [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
    { to: "/staff/pending", label: "Pending", icon: FileText },
    { to: "/staff/approved", label: "Approved", icon: FileText }
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/departments", label: "Departments", icon: Settings },
    { to: "/admin/phase-configuration", label: "Phase Config", icon: Settings },
    { to: "/admin/reports", label: "Reports", icon: FileText },
    { to: "/admin/settings", label: "Settings", icon: Settings }
  ]
};

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const items = role ? navByRole[role] || [] : [];

  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200/70 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 backdrop-blur-glass">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isDashboardRoot = item.to === `/${role}`;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={isDashboardRoot}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  isActive
                    ? "bg-brand-primary text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-900/40"
                ].join(" ")
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

