import Card from "./Card";
import { useAuth } from "../../hooks/useAuth";

/**
 * Staff users must be tied to a department; all staff APIs scope data to that department.
 * Blocks the staff UI if the account has no department (misconfiguration).
 */
export default function StaffDepartmentGuard({ children }) {
  const { user } = useAuth();
  if (user?.role === "staff") {
    const dept = user.department && String(user.department).trim();
    if (!dept) {
      return (
        <div className="p-6 max-w-lg">
          <Card>
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Department required</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This staff account is not assigned to a department. Ask an administrator to assign a department before
              you can use the staff dashboard.
            </p>
          </Card>
        </div>
      );
    }
  }
  return children;
}
