'use client';
import { usePlan } from '../../context/PlanContext';

export default function InvestmentForm() {
  const { plan, updatePlan } = usePlan();
  const { investment } = plan;

  const update = (key: keyof typeof investment, value: number) => {
    updatePlan({ investment: { ...investment, [key]: value } });
  };

  const annualTotal = investment.monthlyInvestment * 12;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 rounded-xl p-4">
        <h3 className="font-semibold text-indigo-800 mb-4">📈 投資積立設定</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">月間投資積立額（合計）</label>
            <div className="relative">
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.monthlyInvestment}
                onChange={(e) => update('monthlyInvestment', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">想定年利回り (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.expectedReturn}
                onChange={(e) => update('expectedReturn', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">NISA月額</label>
            <div className="relative">
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.nisaMonthly}
                onChange={(e) => update('nisaMonthly', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">iDeCo月額</label>
            <div className="relative">
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.idecoMonthly}
                onChange={(e) => update('idecoMonthly', Number(e.target.value))}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-sm text-gray-600">年間投資積立額</p>
        <p className="text-2xl font-bold text-indigo-700">{Math.round(annualTotal / 10000).toLocaleString('ja-JP')}万円</p>
        <p className="text-sm text-gray-500 mt-1">想定利回り {investment.expectedReturn}% / 年</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        ⚠️ シミュレーションは将来を保証するものではありません。利回りは過去の実績に基づく想定値です。
      </div>
    </div>
  );
}
