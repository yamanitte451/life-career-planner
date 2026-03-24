'use client';
import { useState } from 'react';
import { usePlan } from '../../context/PlanContext';
import { runSimulation, formatMan } from '../../lib/simulation';
import SummaryCards from '../../components/dashboard/SummaryCards';
import AssetProjectionChart from '../../components/charts/AssetProjectionChart';
import CashflowChart from '../../components/charts/CashflowChart';
import Link from 'next/link';

const YEAR_OPTIONS = [5, 10, 20, 30];

export default function DashboardPage() {
  const { plan } = usePlan();
  const [selectedYears, setSelectedYears] = useState(30);

  const simulationData = runSimulation(plan, 30);
  const currentData = simulationData[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 ライフプランダッシュボード</h1>
          <Link
            href="/setup"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            プランを編集
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards current={currentData} plan={plan} />
        </div>

        {/* Year selector */}
        <div className="flex gap-2 mb-4">
          <span className="text-sm text-gray-600 self-center">表示期間:</span>
          {YEAR_OPTIONS.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYears(y)}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
                selectedYears === y ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {y}年
            </button>
          ))}
        </div>

        {/* Asset Projection Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">資産推移（{selectedYears}年）</h2>
          {simulationData.length > 0 ? (
            <AssetProjectionChart data={simulationData} years={selectedYears} />
          ) : (
            <p className="text-gray-400 text-center py-8">データがありません</p>
          )}
        </div>

        {/* Cashflow Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">収支推移</h2>
          {simulationData.length > 0 ? (
            <CashflowChart data={simulationData} years={selectedYears} />
          ) : (
            <p className="text-gray-400 text-center py-8">データがありません</p>
          )}
        </div>

        {/* Simulation table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">年次シミュレーション詳細</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="p-2 text-left">年</th>
                  <th className="p-2 text-right">本人年齢</th>
                  <th className="p-2 text-right">年収入</th>
                  <th className="p-2 text-right">年支出</th>
                  <th className="p-2 text-right">年間貯蓄</th>
                  <th className="p-2 text-right">純資産</th>
                  <th className="p-2 text-left">イベント</th>
                </tr>
              </thead>
              <tbody>
                {simulationData.slice(0, selectedYears).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2">{row.year}</td>
                    <td className="p-2 text-right">{row.age}歳</td>
                    <td className="p-2 text-right text-blue-600">{formatMan(row.annualIncome)}</td>
                    <td className="p-2 text-right text-red-600">{formatMan(row.annualExpense)}</td>
                    <td className={`p-2 text-right ${row.annualSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatMan(row.annualSavings)}
                    </td>
                    <td className={`p-2 text-right font-semibold ${row.netAssets >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                      {formatMan(row.netAssets)}
                    </td>
                    <td className="p-2 text-left text-xs text-orange-600">
                      {row.events.length > 0 ? `📅 ${row.events.join(', ')}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
