import Card from "../common/Card";
import Button from "../common/Button";

export default function SequentialPhase({ submissions = [], currentStage = 0, onUpload }) {
  return (
    <Card>
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-secondary">Sequential Phase</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {submissions.map((s, idx) => (
            <div key={`seq-${idx}-${String(s.departmentId?._id ?? s.departmentId ?? s.departmentName ?? "dept")}`} className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
              <div className="text-sm font-medium">{idx + 1}. {s.departmentName || s.departmentId?.name}</div>
              <div className="text-xs text-slate-500">Status: {s.status}</div>
              <Button className="mt-2 w-full" variant="ghost" disabled={idx !== currentStage} onClick={() => onUpload?.(s)}>
                Upload Document
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
