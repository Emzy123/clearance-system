import Card from "../common/Card";
import Button from "../common/Button";
import DepartmentReorder from "./DepartmentReorder";

export default function PhaseConfiguration({
  sequential = [],
  parallel = [],
  onMoveToPhase,
  onReorderUp,
  onReorderDown,
  onSaveOrder
}) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="font-semibold">Clearance Phase Configuration</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-brand-secondary mb-2">Sequential Phase</h4>
            <DepartmentReorder
              sequentialDepartments={sequential}
              onMoveUp={onReorderUp}
              onMoveDown={onReorderDown}
              onSave={onSaveOrder}
            />
            <div className="mt-2 space-y-2">
              {sequential.map((d) => (
                <div key={`seq-${d._id}`} className="flex items-center justify-between text-sm">
                  <span>{d.name}</span>
                  <Button variant="ghost" onClick={() => onMoveToPhase?.(d._id, "parallel")}>Move to Parallel</Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-brand-parallel mb-2">Parallel Phase</h4>
            <div className="space-y-2">
              {parallel.map((d) => (
                <div key={`par-${d._id}`} className="flex items-center justify-between text-sm rounded-lg border border-slate-200/60 dark:border-slate-700 p-2">
                  <span>{d.name}</span>
                  <Button variant="ghost" onClick={() => onMoveToPhase?.(d._id, "sequential")}>Move to Sequential</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
