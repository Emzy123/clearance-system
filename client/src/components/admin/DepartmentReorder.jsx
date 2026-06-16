import Button from "../common/Button";

export default function DepartmentReorder({ sequentialDepartments = [], onMoveUp, onMoveDown, onSave }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {sequentialDepartments.map((d, idx) => (
          <div
            key={d._id}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-brand-secondary/30"
          >
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs">
                {idx + 1}
              </span>
              <span>
                {d.name} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({d.code})</span>
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs px-2 py-1"
                onClick={() => onMoveUp?.(idx)}
                disabled={idx === 0}
              >
                ▲ Up
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs px-2 py-1"
                onClick={() => onMoveDown?.(idx)}
                disabled={idx === sequentialDepartments.length - 1}
              >
                ▼ Down
              </Button>
            </div>
          </div>
        ))}
        {sequentialDepartments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No departments to order.</p>
        ) : null}
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button
          onClick={onSave}
          className="bg-brand-primary hover:bg-brand-primary/95 text-white shadow-sm font-medium rounded-xl text-sm"
          disabled={sequentialDepartments.length === 0}
        >
          Save Sequence Order
        </Button>
      </div>
    </div>
  );
}
