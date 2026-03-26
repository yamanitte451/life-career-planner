'use client';
import { usePlan } from '../../context/PlanContext';
import NumericInput from './NumericInput';
import { AssetAccount, DebtPlan } from '../../lib/types';
import { calculateMortgageMonthly } from '../../lib/simulation';

function MoneyInput({ label, value, onChange, note }: { label: string; value: number; onChange: (v: number) => void; note?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {note && <p className="text-xs text-gray-400 mb-1">{note}</p>}
      <div className="relative">
        <NumericInput
          className="w-full border rounded-lg px-3 py-2 pr-10"
          value={value}
          onChange={onChange}
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

  const updateDebt = <K extends keyof DebtPlan>(key: K, value: DebtPlan[K]) => {
    updatePlan({ debt: { ...debt, [key]: value } });
  };

  const totalAssets = assets.savings + assets.securities + assets.nisa + assets.ideco + assets.cash + assets.other;
  const totalDebt = debt.mortgageLoan + debt.carLoan + debt.studentLoan + debt.otherDebt;

  // 住宅ローン詳細計算
  const hasDetailedMortgage =
    debt.mortgageLoan > 0 &&
    debt.mortgageLoanTermYears > 0;
  const calculatedMonthly = hasDetailedMortgage
    ? calculateMortgageMonthly(debt.mortgageLoan, debt.mortgageInterestRate, debt.mortgageLoanTermYears)
    : null;
  const totalInterest = hasDetailedMortgage && calculatedMonthly !== null
    ? (debt.mortgageInterestRate <= 0
      ? 0
      : calculatedMonthly * debt.mortgageLoanTermYears * 12 - debt.mortgageLoan)
    : null;

  const applyCalculatedMonthly = () => {
    if (calculatedMonthly !== null) {
      updatePlan({ debt: { ...debt, mortgageMonthly: calculatedMonthly } });
    }
  };

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
          <div>
            <label className="block text-sm text-gray-600 mb-1">住宅ローン月返済額</label>
            {calculatedMonthly !== null && (
              <p className="text-xs text-blue-600 mb-1">
                詳細計算値: {Math.round(calculatedMonthly / 10000 * 10) / 10}万円/月
              </p>
            )}
            <div className="relative">
              <NumericInput
                className="w-full border rounded-lg px-3 py-2 pr-10"
                value={debt.mortgageMonthly}
                onChange={(v) => updateDebt('mortgageMonthly', v)}
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">円</span>
            </div>
          </div>
          <MoneyInput label="自動車ローン残高" value={debt.carLoan} onChange={(v) => updateDebt('carLoan', v)} />
          <MoneyInput label="奨学金残高" value={debt.studentLoan} onChange={(v) => updateDebt('studentLoan', v)} />
          <MoneyInput label="その他借入" value={debt.otherDebt} onChange={(v) => updateDebt('otherDebt', v)} />
        </div>

        {/* 住宅ローン詳細計算 */}
        {debt.mortgageLoan > 0 && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <h4 className="text-sm font-semibold text-red-700 mb-3">🧮 住宅ローン詳細計算（任意）</h4>
            <p className="text-xs text-gray-500 mb-3">
              金利と残存期間を入力すると月返済額を自動計算します（元利均等返済）。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">年利 (%)</label>
                <div className="relative">
                  <NumericInput
                    step="0.01"
                    allowDecimal
                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm"
                    value={debt.mortgageInterestRate}
                    onChange={(v) => updateDebt('mortgageInterestRate', v)}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">残存返済期間（年）</label>
                <div className="relative">
                  <NumericInput
                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm"
                    value={debt.mortgageLoanTermYears}
                    onChange={(v) => updateDebt('mortgageLoanTermYears', v)}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">年</span>
                </div>
              </div>
            </div>
            {hasDetailedMortgage && calculatedMonthly !== null && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-red-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">月返済額（計算値）</span>
                  <span className="font-bold text-red-700">
                    {Math.round(calculatedMonthly).toLocaleString('ja-JP')} 円/月
                  </span>
                </div>
                {totalInterest !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">利息総額（概算）</span>
                    <span className="font-bold text-orange-700">
                      {Math.round(totalInterest / 10000).toLocaleString('ja-JP')} 万円
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={applyCalculatedMonthly}
                  className="w-full text-sm bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  この月返済額を適用する
                </button>
                <p className="text-xs text-gray-400">
                  ※ 詳細パラメータが設定されている場合、シミュレーションでは計算値が優先されます。
                </p>
              </div>
            )}
          </div>
        )}

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
