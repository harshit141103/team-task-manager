"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { ChoiceCount, ProductivityPoint } from "@/lib/types/domain";

const palette = ["#14b8a6", "#f59e0b", "#ec4899", "#22c55e", "#ef4444"];

export function ProductivityChart({ data }: { data: ProductivityPoint[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="completed" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "#151923", border: "1px solid #303642", borderRadius: 8 }} />
          <Area type="monotone" dataKey="completed" stroke="#14b8a6" fill="url(#completed)" strokeWidth={2} />
          <Area type="monotone" dataKey="created" stroke="#f59e0b" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChoicePieChart({ data }: { data: ChoiceCount[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="label" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#151923", border: "1px solid #303642", borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChoiceBarChart({ data }: { data: ChoiceCount[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#151923", border: "1px solid #303642", borderRadius: 8 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={palette[index % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
