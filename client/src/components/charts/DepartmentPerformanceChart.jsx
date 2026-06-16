import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DepartmentPerformanceChart({ data = [] }) {
  // Translate keys to friendly names for Legend
  const chartData = data.map((d) => ({
    ...d,
    "Cleared Students": d.approved || 0,
    "Pending Approval": d.pending || 0,
    "Active at Stage": d.activeCount || 0
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="code" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip contentStyle={{ borderRadius: "8px" }} />
          <Legend />
          <Bar dataKey="Cleared Students" fill="#5C2C16" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Pending Approval" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Active at Stage" fill="#A0522D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
