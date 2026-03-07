'use client';
import { usePlan } from '../../context/PlanContext';
import { AssetAccount, DebtPlan } from '../../lib/types';

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
    </div>
  );
}

export default function AssetForm() {
  const { plan, updatePlan } = usePlan();
  const { assets, debt } = plan;

  const updateAsset = (key: keyof AssetAccount, value: number) => {
    updatePlan({ assets: { ...assets, [key]: value } });
  };

  const updateDebt = (key: keyof DebtPlan, value: number) => {
    updatePlan({ debt: { ...debt, [key]: value } });
  };

  const totalAssets = assets.savings + assets.securities + assets.nisa + assets.ideco + assets.cash + assets.other;
  const totalDebt = debt.mortgageLoan + debt.carLoan + debt.studentLoan + debt.otherDebt;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 mb-4">💰 資産</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="預金（銀行口座）" value={assets.savings} onChange={(v) => updateAsset('savings', v)} />
          <MoneyInput label="現金" value={assets.cash} onChange={(v) => updateAsset('cash', v)} />
          <MoneyInput label="証券資産（株・投信等）" value={assets.securities} onChange={(v) => updateAsset('securities', v)} />
          <MoneyInput label="NISA残高" value={assets.nisa} onChange={(v) => updateAsset('nisa', v)} />
          <MoneyInput label="iDeCo残高" value={assets.ideco} onChange={(v) => updateAsset('ideco', v)} />
          <MoneyInput label="その他資産" value={assets.other} onChange={(v) => updateAsset('other', v)} />
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <p className="text-sm text-gray-600">総資産</p>
          <p className="text-xl font-bold text-green-700">{Math.round(totalAssets / 10000).toLocaleString('ja-JP')}万円</p>
        </div>
      </div>
      <div className="bg-red-50 rounded-xl p-4">
        <h3 className="font-semibold text-red-800 mb-4">🏦 負債</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="住宅ローン残高" value={debt.mortgageLoan} onChange={(v) => updateDebt('mortgageLoan', v)} />
          <MoneyInput label="住宅ローン月返済額" value={debt.mortgageMonthly} onChange={(v) => updateDebt('mortgageMonthly', v)} />
          <MoneyInput label="自動車ローン残高" value={debt.carLoan} onChange={(v) => updateDebt('carLoan', v)} />
          <MoneyInput label="奨学金残高" value={debt.studentLoan} onChange={(v) => updateDebt('studentLoan', v)} />
          <MoneyInput label="その他借入" value={debt.otherDebt} onChange={(v) => updateDebt('otherDebt', v)} />
        </div>
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-sm text-gray-600">総負債</p>
          <p className="text-xl font-bold text-red-700">{Math.round(totalDebt / 10000).toLocaleString('ja-JP')}万円</p>
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-sm text-gray-600">純資産（総資産 - 総負債）</p>
        <p className={`text-2xl font-bold ${totalAssets - totalDebt >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
          {Math.round((totalAssets - totalDebt) / 10000).toLocaleString('ja-JP')}万円
        </p>
      </div>
    </div>
  );
}
