import Card from "../common/Card";

export default function ClearanceTimeline({ clearance }) {
  const seq = clearance?.sequentialPhase?.submissions || [];
  const par = clearance?.parallelPhase?.submissions || [];
  return (
    <Card>
      <h3 className="font-semibold mb-3">Clearance Timeline</h3>
      <div className="space-y-2 text-sm">
        {seq.map((s, i) => (
          <div key={`seq-${i}-${String(s.departmentId?._id ?? s.departmentId ?? s.departmentName ?? "dept")}`}>
            Sequential: {s.departmentName} - {s.status} {s.approvedAt ? `(${new Date(s.approvedAt).toLocaleString()})` : ""}
          </div>
        ))}
        {par.map((s, i) => (
          <div key={`par-${i}-${String(s.departmentId?._id ?? s.departmentId ?? s.departmentName ?? "dept")}`}>
            Parallel: {s.departmentName} - {s.status} {s.approvedAt ? `(${new Date(s.approvedAt).toLocaleString()})` : ""}
          </div>
        ))}
      </div>
    </Card>
  );
}
