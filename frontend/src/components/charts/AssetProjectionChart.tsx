'use client';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SimulationYearData } from '../../lib/types';

interface Props {
  data: SimulationYearData[];
  years: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const yearData = payload[0]?.payload;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Math.round(p.value / 10000).toLocaleString('ja-JP')}万円
        </p>
      ))}
      {yearData?.events?.length > 0 && (
        <p className="mt-1 text-orange-600 font-medium">
          📅 {yearData.events.join(', ')}
        </p>
      )}
    </div>
  );
};

export default function AssetProjectionChart({ data, years }: Props) {
  const filtered = data.slice(0, years);
  const chartData = filtered.map((d) => ({
    year: `${d.year}(${d.age}歳)`,
    '現預金': Math.round(d.savings / 10000),
    '投資資産': Math.round(d.investments / 10000),
    '負債': Math.round(d.totalDebt / 10000),
    '純資産': Math.round(d.netAssets / 10000),
    events: d.events,
  }));

  // Find years with events for reference lines
  const eventYears = chartData
    .filter((d) => d.events && d.events.length > 0)
    .map((d) => ({ year: d.year, label: d.events.join(', ') }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${v}万`} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '80px' }} />
        <Area type="monotone" dataKey="現預金" stackId="1" stroke="#6366f1" fill="#c7d2fe" />
        <Area type="monotone" dataKey="投資資産" stackId="1" stroke="#10b981" fill="#a7f3d0" />
        <Area type="monotone" dataKey="負債" stackId="2" stroke="#ef4444" fill="#fecaca" />
        <Line type="monotone" dataKey="純資産" stroke="#f59e0b" strokeWidth={2} dot={false} />
        {eventYears.map((ev) => (
          <ReferenceLine
            key={ev.year}
            x={ev.year}
            stroke="#f97316"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: '📅', position: 'top', fontSize: 14 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
