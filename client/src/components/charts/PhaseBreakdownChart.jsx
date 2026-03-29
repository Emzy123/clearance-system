import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function PhaseBreakdownChart({ metrics }) {
  const data = [
    { name: "Sequential", value: metrics?.studentsInSequentialPhase || 0, color: "#14B8A6" },
    { name: "Parallel", value: metrics?.studentsInParallelPhase || 0, color: "#8B5CF6" }
  ];
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
