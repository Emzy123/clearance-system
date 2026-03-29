import Card from "../common/Card";
import Button from "../common/Button";

export default function ParallelPhase({ canSubmit, submissions = [], onSubmitAll, onSubmitSingle }) {
  return (
    <Card>
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-parallel">Parallel Phase</h3>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Departments in this phase can be submitted independently at any time.
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {submissions.map((s) => (
            <div key={String(s.departmentId?._id || s.departmentId)} className="rounded-lg border border-slate-200/60 dark:border-slate-700 p-3">
              <div className="font-medium">{s.departmentName || s.departmentId?.name}</div>
              <div className="text-xs text-slate-500">Status: {s.status}</div>
              <Button className="mt-2 w-full" variant="ghost" onClick={() => onSubmitSingle?.(s)}>
                Submit Individual
              </Button>
            </div>
          ))}
        </div>
        <Button onClick={onSubmitAll}>Submit All Documents</Button>
      </div>
    </Card>
  );
}
