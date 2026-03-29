import Card from "../common/Card";

export default function HybridAnalytics({ metrics }) {
  return (
    <Card>
      <h3 className="font-semibold mb-3">Hybrid Analytics</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
          <div>Students in Sequential</div>
          <div className="text-xl font-semibold">{metrics?.studentsInSequentialPhase ?? 0}</div>
        </div>
        <div className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
          <div>Students in Parallel</div>
          <div className="text-xl font-semibold">{metrics?.studentsInParallelPhase ?? 0}</div>
        </div>
        <div className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
          <div>Fully Cleared</div>
          <div className="text-xl font-semibold">{metrics?.approvedRequests ?? 0}</div>
        </div>
        <div className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
          <div>Completion Rate</div>
          <div className="text-xl font-semibold">{metrics?.completionRate ?? 0}%</div>
        </div>
      </div>
    </Card>
  );
}
