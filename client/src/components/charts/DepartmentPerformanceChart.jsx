import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DepartmentPerformanceChart({ data = [] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="code" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="approved" fill="#14B8A6" />
          <Bar dataKey="pending" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
