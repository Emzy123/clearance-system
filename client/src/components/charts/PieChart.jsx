import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#1E3A8A", "#14B8A6", "#F59E0B", "#EF4444", "#64748B"];

export default function PieChart({ data, nameKey = "name", valueKey = "value" }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Tooltip />
          <Legend />
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={90}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}

