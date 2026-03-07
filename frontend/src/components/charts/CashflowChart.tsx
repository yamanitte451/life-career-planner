'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SimulationYearData } from '../../lib/types';

interface Props {
  data: SimulationYearData[];
  years: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}年</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Math.round(p.value / 10000).toLocaleString('ja-JP')}万円
        </p>
      ))}
    </div>
  );
};

export default function CashflowChart({ data, years }: Props) {
  const filtered = data.slice(0, years);
  const chartData = filtered.map((d) => ({
    year: `${d.year}`,
    '年収入': Math.round(d.annualIncome / 10000),
    '年支出': Math.round(d.annualExpense / 10000),
    '年間貯蓄': Math.round(d.annualSavings / 10000),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${v}万`} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="年収入" fill="#6366f1" />
        <Bar dataKey="年支出" fill="#ef4444" />
        <Bar dataKey="年間貯蓄" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
