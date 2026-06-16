import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function LineChart({ data, xKey = "date", yKey = "approved" }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xKey} stroke="#6b7280" fontSize={11} />
          <YAxis stroke="#6b7280" fontSize={11} />
          <Tooltip contentStyle={{ borderRadius: "8px" }} />
          <Line type="monotone" dataKey={yKey} stroke="#5C2C16" strokeWidth={3} dot={{ stroke: "#D4AF37", strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

