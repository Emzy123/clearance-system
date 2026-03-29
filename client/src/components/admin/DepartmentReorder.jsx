import Button from "../common/Button";

export default function DepartmentReorder({ sequentialDepartments = [], onMoveUp, onMoveDown, onSave }) {
  return (
    <div className="space-y-2">
      {sequentialDepartments.map((d, idx) => (
        <div key={d._id} className="flex items-center justify-between rounded-lg border border-slate-200/60 dark:border-slate-700 p-2">
          <div className="text-sm">{idx + 1}. {d.name}</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onMoveUp?.(idx)} disabled={idx === 0}>Up</Button>
            <Button variant="ghost" onClick={() => onMoveDown?.(idx)} disabled={idx === sequentialDepartments.length - 1}>Down</Button>
          </div>
        </div>
      ))}
      <Button onClick={onSave}>Save Order</Button>
    </div>
  );
}
