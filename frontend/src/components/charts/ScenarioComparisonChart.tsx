'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SimulationYearData } from '../../lib/types';
import { formatMan } from '../../lib/simulation';

function formatYAxis(v: number): string {
  if (Math.abs(v) >= 100000000) {
    return `${(v / 100000000).toFixed(0)}億`;
  }
  return `${Math.round(v / 10000)}万`;
}

interface Props {
  data1: SimulationYearData[];
  label1: string;
  data2: SimulationYearData[];
  label2: string;
  years: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Math.round(p.value / 10000).toLocaleString('ja-JP')}万円
        </p>
      ))}
    </div>
  );
};

export default function ScenarioComparisonChart({ data1, label1, data2, label2, years }: Props) {
  const len = Math.min(years, Math.max(data1.length, data2.length));
  const chartData = Array.from({ length: len }, (_, i) => {
    const d1 = data1[i];
    const d2 = data2[i];
    const year = d1?.year ?? d2?.year ?? new Date().getFullYear() + i;
    const age = d1?.age ?? d2?.age ?? i;
    return {
      year: `${year}(${age}歳)`,
      [label1]: d1?.netAssets ?? null,
      [label2]: d2?.netAssets ?? null,
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '80px' }} />
          <Line
            type="monotone"
            dataKey={label1}
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey={label2}
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Comparison table */}
      <ComparisonTable data1={data1} label1={label1} data2={data2} label2={label2} years={years} />
    </div>
  );
}

function ComparisonTable({
  data1,
  label1,
  data2,
  label2,
  years,
}: {
  data1: SimulationYearData[];
  label1: string;
  data2: SimulationYearData[];
  label2: string;
  years: number;
}) {
  const milestones = [5, 10, 20, 30].filter((y) => y <= years);

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="p-2 text-left">指標</th>
            {milestones.map((y) => (
              <th key={y} className="p-2 text-right">
                {y}年後
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Net assets: label1 */}
          <tr className="bg-indigo-50">
            <td className="p-2 text-indigo-700 font-medium">{label1}（純資産）</td>
            {milestones.map((y) => {
              const row = data1[y - 1];
              return (
                <td key={y} className="p-2 text-right text-indigo-700 font-semibold">
                  {row ? formatMan(row.netAssets) : '-'}
                </td>
              );
            })}
          </tr>
          {/* Net assets: label2 */}
          <tr className="bg-amber-50">
            <td className="p-2 text-amber-700 font-medium">{label2}（純資産）</td>
            {milestones.map((y) => {
              const row = data2[y - 1];
              return (
                <td key={y} className="p-2 text-right text-amber-700 font-semibold">
                  {row ? formatMan(row.netAssets) : '-'}
                </td>
              );
            })}
          </tr>
          {/* Difference */}
          <tr className="bg-gray-50 border-t">
            <td className="p-2 text-gray-600">差額（現在 − 比較）</td>
            {milestones.map((y) => {
              const r1 = data1[y - 1];
              const r2 = data2[y - 1];
              if (!r1 || !r2) return <td key={y} className="p-2 text-right">-</td>;
              const diff = r1.netAssets - r2.netAssets;
              return (
                <td
                  key={y}
                  className={`p-2 text-right font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {diff >= 0 ? '+' : ''}{formatMan(diff)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
