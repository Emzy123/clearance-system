import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";

export default function ClearanceProgress({ overall = 0, status = "pending" }) {
  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30";
      case "rejected":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30";
      case "in_progress":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Clearance Completion
            </span>
            <div className="text-3xl font-extrabold text-slate-950 dark:text-white font-display">
              {overall}%
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadge()}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        <ProgressBar value={overall} colorClass="bg-brand-primary" />
      </div>
    </Card>
  );
}
