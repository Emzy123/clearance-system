import Button from "../common/Button";
import DepartmentReorder from "./DepartmentReorder";

export default function PhaseConfiguration({
  sequential = [],
  onReorderUp,
  onReorderDown,
  onSaveOrder
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Clearance Sequence Pipeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Students must clear each stage sequentially in the order listed below.
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-secondary/10 text-brand-secondary">
          Sequential-Only Flow
        </span>
      </div>
      <div className="max-w-2xl bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
        <DepartmentReorder
          sequentialDepartments={sequential}
          onMoveUp={onReorderUp}
          onMoveDown={onReorderDown}
          onSave={onSaveOrder}
        />
      </div>
    </div>
  );
}
