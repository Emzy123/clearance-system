import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getAnalytics } from "../../services/adminService";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import LineChart from "../../components/charts/LineChart";
import DepartmentPerformanceChart from "../../components/charts/DepartmentPerformanceChart";
import PhaseBreakdownChart from "../../components/charts/PhaseBreakdownChart";
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
        <h2 className="text-xl font-semibold">Admin Dashboard</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">System analytics overview.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-slate-600 dark:text-slate-300">Total requests</div>
          <div className="text-2xl font-semibold">{metrics?.totalRequests ?? 0}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-600 dark:text-slate-300">Approved</div>
          <div className="text-2xl font-semibold">{metrics?.approvedRequests ?? 0}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-600 dark:text-slate-300">Completion rate</div>
          <div className="text-2xl font-semibold">{metrics?.completionRate ?? 0}%</div>
        </Card>
      </div>
      <HybridAnalytics metrics={metrics} />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-semibold mb-3">Clearance completion trend</div>
          <LineChart data={trend || []} yKey="approved" />
        </Card>
        <Card>
          <div className="font-semibold mb-3">Phase breakdown</div>
          <PhaseBreakdownChart metrics={metrics} />
        </Card>
        <Card className="lg:col-span-2">
          <div className="font-semibold mb-3">Department pending vs approved</div>
          <DepartmentPerformanceChart data={departmentStats || []} />
        </Card>
      </div>
    </div>
  );
}
