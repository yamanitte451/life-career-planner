'use client';
import { MilestoneMetrics } from '../../lib/milestoneMetrics';
import { formatMan } from '../../lib/simulation';

interface Props {
  metrics: MilestoneMetrics;
}

export default function MilestoneCards({ metrics }: Props) {
  const cards = [
    {
      label: '60歳時点の純資産',
      value: metrics.netAssetsAt60 !== null ? formatMan(metrics.netAssetsAt60) : '—',
      sub: metrics.netAssetsAt60 !== null && metrics.netAssetsAt60 < 0 ? '老後資金の見直しを検討' : null,
      color: metrics.netAssetsAt60 === null
        ? 'bg-gray-50 border-gray-200'
        : metrics.netAssetsAt60 >= 0
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200',
      textColor: metrics.netAssetsAt60 === null
        ? 'text-gray-400'
        : metrics.netAssetsAt60 >= 0
          ? 'text-emerald-700'
          : 'text-red-700',
      icon: '🎯',
    },
    {
      label: '支出ピーク年',
      value: metrics.peakExpenseYear ? `${metrics.peakExpenseYear.age}歳` : '—',
      sub: metrics.peakExpenseYear
        ? `${metrics.peakExpenseYear.year}年 / ${formatMan(metrics.peakExpenseYear.amount)}`
        : null,
      color: metrics.peakExpenseYear ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200',
      textColor: metrics.peakExpenseYear ? 'text-orange-700' : 'text-gray-400',
      icon: '📊',
    },
    {
      label: '教育費ピーク年',
      value: metrics.peakEducationYear ? `${metrics.peakEducationYear.age}歳` : '—',
      sub: metrics.peakEducationYear
        ? `${metrics.peakEducationYear.year}年 / ${formatMan(metrics.peakEducationYear.amount)}`
        : '教育費が発生しない期間',
      color: metrics.peakEducationYear
        ? 'bg-purple-50 border-purple-200'
        : 'bg-gray-50 border-gray-200',
      textColor: metrics.peakEducationYear ? 'text-purple-700' : 'text-gray-400',
      icon: '🎓',
    },
    {
      label: '資産マイナス警告',
      value: metrics.negativeNetAssetsYear ? `${metrics.negativeNetAssetsYear.age}歳` : 'なし',
      sub: metrics.negativeNetAssetsYear
        ? `${metrics.negativeNetAssetsYear.year}年に純資産がマイナスに`
        : 'シミュレーション期間中は安全',
      color: metrics.negativeNetAssetsYear
        ? 'bg-red-50 border-red-200'
        : 'bg-green-50 border-green-200',
      textColor: metrics.negativeNetAssetsYear ? 'text-red-700' : 'text-green-700',
      icon: metrics.negativeNetAssetsYear ? '⚠️' : '✅',
    },
    {
      label: '30年累計収支バランス',
      value: formatMan(metrics.lifetimeBalance),
      sub: metrics.lifetimeBalance >= 0 ? '黒字' : '赤字',
      color: metrics.lifetimeBalance >= 0
        ? 'bg-blue-50 border-blue-200'
        : 'bg-red-50 border-red-200',
      textColor: metrics.lifetimeBalance >= 0 ? 'text-blue-700' : 'text-red-700',
      icon: '💹',
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 mb-3">マイルストーン指標</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-3 ${c.color}`}>
            <div className="text-xl mb-1">{c.icon}</div>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.textColor}`}>{c.value}</p>
            {c.sub && <p className="text-xs text-gray-400 mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
