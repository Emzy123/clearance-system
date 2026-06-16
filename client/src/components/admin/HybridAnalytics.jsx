import Card from "../common/Card";

export default function HybridAnalytics({ metrics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="border-l-4 border-l-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Requests</div>
        <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
          {metrics?.totalRequests ?? 0}
        </div>
      </Card>
      <Card className="border-l-4 border-l-brand-primary bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Requests</div>
        <div className="text-2xl font-bold text-brand-primary mt-1">
          {metrics?.activeRequests ?? metrics?.studentsInSequentialPhase ?? 0}
        </div>
      </Card>
      <Card className="border-l-4 border-l-amber-600 bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Rejected Requests</div>
        <div className="text-2xl font-bold text-amber-600 mt-1">
          {metrics?.rejectedRequests ?? metrics?.studentsInParallelPhase ?? 0}
        </div>
      </Card>
      <Card className="border-l-4 border-l-brand-secondary bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Fully Cleared</div>
        <div className="text-2xl font-bold text-brand-secondary mt-1">
          {metrics?.approvedRequests ?? 0}
        </div>
      </Card>
      <Card className="border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900 shadow-sm">
        <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Completion Rate</div>
        <div className="text-2xl font-bold text-emerald-600 mt-1">
          {metrics?.completionRate ?? 0}%
        </div>
      </Card>
    </div>
  );
}
