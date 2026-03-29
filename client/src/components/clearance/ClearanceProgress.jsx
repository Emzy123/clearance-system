import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";

export default function ClearanceProgress({ overall = 0, sequential = 0, parallel = 0, status = "pending" }) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Overall progress</div>
            <div className="text-2xl font-semibold">{overall}%</div>
          </div>
          <span className="rounded-full px-3 py-1 bg-slate-100/70 dark:bg-slate-900/40 text-sm">{status}</span>
        </div>
        <ProgressBar value={overall} colorClass="bg-brand-primary" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs mb-1">Sequential phase</div>
            <ProgressBar value={sequential} colorClass="bg-brand-secondary" />
          </div>
          <div>
            <div className="text-xs mb-1">Parallel phase</div>
            <ProgressBar value={parallel} colorClass="bg-brand-parallel" />
          </div>
        </div>
      </div>
    </Card>
  );
}
