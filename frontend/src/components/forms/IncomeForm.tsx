'use client';
import { usePlan } from '../../context/PlanContext';

function MoneyInput({ label, value, onChange, note }: { label: string; value: number; onChange: (v: number) => void; note?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {note && <p className="text-xs text-gray-400 mb-1">{note}</p>}
      <div className="relative">
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 pr-10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{Math.round(value / 10000).toLocaleString('ja-JP')}万円</p>
    </div>
  );
}

export default function IncomeForm() {
  const { plan, updatePlan } = usePlan();
  const { income } = plan;

  const update = (key: keyof typeof income, value: number) => {
    updatePlan({ income: { ...income, [key]: value } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-4">🧑 本人の収入</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="年収" value={income.selfAnnualIncome} onChange={(v) => update('selfAnnualIncome', v)} note="基本給ベース（賞与除く）" />
          <MoneyInput label="賞与（年間）" value={income.selfBonus} onChange={(v) => update('selfBonus', v)} />
        </div>
      </div>
      <div className="bg-pink-50 rounded-xl p-4">
        <h3 className="font-semibold text-pink-800 mb-4">💑 配偶者の収入</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="年収" value={income.spouseAnnualIncome} onChange={(v) => update('spouseAnnualIncome', v)} note="基本給ベース（賞与除く）" />
          <MoneyInput label="賞与（年間）" value={income.spouseBonus} onChange={(v) => update('spouseBonus', v)} />
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 mb-4">💡 その他の収入</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="副業収入（年間）" value={income.sideJobIncome} onChange={(v) => update('sideJobIncome', v)} />
          <MoneyInput label="その他収入（年間）" value={income.otherIncome} onChange={(v) => update('otherIncome', v)} note="不動産・配当など" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-sm text-gray-600">世帯年収合計</p>
        <p className="text-2xl font-bold text-indigo-700">
          {Math.round((income.selfAnnualIncome + income.spouseAnnualIncome + income.selfBonus + income.spouseBonus + income.sideJobIncome + income.otherIncome) / 10000).toLocaleString('ja-JP')}万円
        </p>
      </div>
    </div>
  );
}
