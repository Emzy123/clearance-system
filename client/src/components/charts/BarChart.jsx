import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function BarChart({ data, xKey = "code", aKey = "pending", bKey = "approved" }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={aKey} fill="#F59E0B" />
          <Bar dataKey={bKey} fill="#14B8A6" />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

