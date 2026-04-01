import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Chart = ({ data, darkMode }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey="month"
          stroke={darkMode ? "#9ca3af" : "#6b7280"}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <YAxis
          yAxisId="left"
          stroke={darkMode ? "#9ca3af" : "#6b7280"}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={darkMode ? "#9ca3af" : "#6b7280"}
          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            borderColor: darkMode ? "#374151" : "#e5e7eb",
            color: darkMode ? "#ffffff" : "#000000",
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="patients"
          stroke="#8b5cf6"
          strokeWidth={2}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="appointments"
          stroke="#10b981"
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="income"
          stroke="#f59e0b"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
