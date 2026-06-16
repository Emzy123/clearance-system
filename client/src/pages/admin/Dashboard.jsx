import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getAnalytics } from "../../services/adminService";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import LineChart from "../../components/charts/LineChart";
import DepartmentPerformanceChart from "../../components/charts/DepartmentPerformanceChart";
import HybridAnalytics from "../../components/admin/HybridAnalytics";

export default function Dashboard() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAnalytics(token),
    enabled: Boolean(token)
  });

  if (q.isLoading) return <div className="p-6"><Loader /></div>;

  const { metrics, departmentStats, trend } = q.data || {};

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real-time clearance tracking and analytics for Confluence University of Science and Technology.
        </p>
      </div>

      <HybridAnalytics metrics={metrics} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <div className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Clearance Approvals Trend</div>
          <p className="text-xs text-slate-400 mb-4">Daily approvals over the last 14 days.</p>
          <LineChart data={trend || []} yKey="approved" />
        </Card>
        
        <Card className="lg:col-span-2 shadow-sm">
          <div className="font-semibold mb-3 text-slate-700 dark:text-slate-300">Department stage metrics</div>
          <p className="text-xs text-slate-400 mb-4">
            Comparison of cleared, pending action, and current active students at each stage.
          </p>
          <DepartmentPerformanceChart data={departmentStats || []} />
        </Card>
      </div>
    </div>
  );
}
