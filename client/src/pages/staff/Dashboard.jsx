import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { statistics } from "../../services/staffService";
import Card from "../../components/common/Card";
import PendingRequests from "./PendingRequests";

export default function Dashboard() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["staff-stats"],
    queryFn: () => statistics(token),
    enabled: Boolean(token)
  });

  const dept = q.data?.department;
  return (
    <div className="space-y-4">
      <div className="p-6 pb-0">
        <h2 className="text-xl font-semibold">Staff Dashboard</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Department: <span className="font-medium">{dept?.name || "—"}</span>
        </p>
      </div>

      <div className="px-6 grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm text-slate-600 dark:text-slate-300">Pending</div>
          <div className="text-2xl font-semibold">{q.data?.pending ?? 0}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-600 dark:text-slate-300">Total processed</div>
          <div className="text-2xl font-semibold">{q.data?.totalProcessed ?? 0}</div>
        </Card>
      </div>

      <PendingRequests />
    </div>
  );
}

