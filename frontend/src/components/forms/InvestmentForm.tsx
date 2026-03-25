'use client';
import { usePlan } from '../../context/PlanContext';
import NumericInput from './NumericInput';

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
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.monthlyInvestment}
                onChange={(value) => update('monthlyInvestment', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">想定年利回り (%)</label>
            <div className="relative">
              <NumericInput
                step="0.1"
                allowDecimal
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.expectedReturn}
                onChange={(value) => update('expectedReturn', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">NISA月額</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.nisaMonthly}
                onChange={(value) => update('nisaMonthly', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">iDeCo月額</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.idecoMonthly}
                onChange={(value) => update('idecoMonthly', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 rounded-xl p-4">
        <h3 className="font-semibold text-purple-800 mb-4">📊 シミュレーション前提（高度設定）</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">昇給率（年率 %）</label>
            <div className="relative">
              <NumericInput
                step="0.1"
                allowDecimal
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.salaryGrowthRate}
                onChange={(value) => update('salaryGrowthRate', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">毎年の収入増加率（0 = 変化なし）</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">物価上昇率（年率 %）</label>
            <div className="relative">
              <NumericInput
                step="0.1"
                allowDecimal
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.inflationRate}
                onChange={(value) => update('inflationRate', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">毎年の支出増加率（0 = 変化なし）</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">年金月額</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.pensionMonthly}
                onChange={(value) => update('pensionMonthly', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">受給開始後の月額（0 = 年金なし）</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">年金受給開始年齢</label>
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={investment.pensionStartAge}
                onChange={(value) => update('pensionStartAge', value)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">歳</span>
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
