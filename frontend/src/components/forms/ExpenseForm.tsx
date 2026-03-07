'use client';
import { usePlan } from '../../context/PlanContext';
import { ExpensePlan } from '../../lib/types';

function MoneyInput({ label, value, onChange, unit = '月' }: { label: string; value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}<span className="text-xs text-gray-400 ml-1">（{unit}）</span></label>
      <div className="relative">
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 pr-10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
      </div>
    </div>
  );
}

export default function ExpenseForm() {
  const { plan, updatePlan } = usePlan();
  const { expense } = plan;

  const update = (key: keyof ExpensePlan, value: number) => {
    updatePlan({ expense: { ...expense, [key]: value } });
  };

  const monthlyTotal = expense.housing + expense.food + expense.utilities + expense.communication +
    expense.insurance + expense.car + expense.dailyGoods + expense.entertainment +
    expense.otherFixed + expense.otherVariable;

  return (
    <div className="space-y-6">
      <div className="bg-red-50 rounded-xl p-4">
        <h3 className="font-semibold text-red-800 mb-4">🏠 固定費</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="家賃 / 住宅ローン" value={expense.housing} onChange={(v) => update('housing', v)} />
          <MoneyInput label="光熱費" value={expense.utilities} onChange={(v) => update('utilities', v)} />
          <MoneyInput label="通信費" value={expense.communication} onChange={(v) => update('communication', v)} />
          <MoneyInput label="保険料" value={expense.insurance} onChange={(v) => update('insurance', v)} />
          <MoneyInput label="車関連費" value={expense.car} onChange={(v) => update('car', v)} />
          <MoneyInput label="その他固定費" value={expense.otherFixed} onChange={(v) => update('otherFixed', v)} />
        </div>
      </div>
      <div className="bg-orange-50 rounded-xl p-4">
        <h3 className="font-semibold text-orange-800 mb-4">🛒 変動費</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="食費" value={expense.food} onChange={(v) => update('food', v)} />
          <MoneyInput label="日用品費" value={expense.dailyGoods} onChange={(v) => update('dailyGoods', v)} />
          <MoneyInput label="趣味・娯楽費" value={expense.entertainment} onChange={(v) => update('entertainment', v)} />
          <MoneyInput label="旅行費" value={expense.travel} onChange={(v) => update('travel', v)} unit="年" />
          <MoneyInput label="その他変動費" value={expense.otherVariable} onChange={(v) => update('otherVariable', v)} />
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-sm text-gray-600">月間支出合計</p>
        <p className="text-2xl font-bold text-red-600">{monthlyTotal.toLocaleString('ja-JP')}円</p>
        <p className="text-sm text-gray-500 mt-1">年間: {Math.round(monthlyTotal * 12 / 10000).toLocaleString('ja-JP')}万円 + 旅行費 {Math.round(expense.travel / 10000).toLocaleString('ja-JP')}万円</p>
      </div>
    </div>
  );
}
