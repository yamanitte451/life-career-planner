'use client';
import { LifePlan } from '../../lib/types';

interface Props {
  plan: LifePlan;
}

interface Advice {
  type: 'success' | 'warning' | 'info';
  message: string;
}

export function generateAdvice(plan: LifePlan): Advice[] {
  const adviceList: Advice[] = [];

  const totalAnnualIncome =
    plan.income.selfAnnualIncome +
    plan.income.spouseAnnualIncome +
    plan.income.selfBonus +
    plan.income.spouseBonus +
    plan.income.sideJobIncome +
    plan.income.otherIncome;

  const monthlyExpense =
    plan.expense.housing +
    plan.expense.food +
    plan.expense.utilities +
    plan.expense.communication +
    plan.expense.insurance +
    plan.expense.car +
    plan.expense.dailyGoods +
    plan.expense.entertainment +
    plan.expense.otherFixed +
    plan.expense.otherVariable;

  const annualExpense = monthlyExpense * 12 + plan.expense.travel;

  const totalAssets =
    plan.assets.savings +
    plan.assets.securities +
    plan.assets.nisa +
    plan.assets.ideco +
    plan.assets.cash +
    plan.assets.other;

  const totalDebt =
    plan.debt.mortgageLoan +
    plan.debt.carLoan +
    plan.debt.studentLoan +
    plan.debt.otherDebt;

  const annualInvestment = plan.investment.monthlyInvestment * 12;
  const annualDebtRepayment = plan.debt.mortgageMonthly * 12;
  const annualSavings =
    totalAnnualIncome - annualExpense - annualInvestment - annualDebtRepayment;
  const savingsRate = totalAnnualIncome > 0 ? annualSavings / totalAnnualIncome : 0;

  // Savings rate advice
  if (savingsRate >= 0.2) {
    adviceList.push({
      type: 'success',
      message: `貯蓄率は${Math.round(savingsRate * 100)}%です。一般的な目安（20%以上）を達成しています。`,
    });
  } else if (savingsRate >= 0.1) {
    adviceList.push({
      type: 'info',
      message: `貯蓄率は${Math.round(savingsRate * 100)}%です。理想は20%以上ですが、まずまずの水準です。`,
    });
  } else if (savingsRate >= 0) {
    adviceList.push({
      type: 'warning',
      message: `貯蓄率が${Math.round(savingsRate * 100)}%と低めです。支出の見直しを検討してみましょう。`,
    });
  } else {
    adviceList.push({
      type: 'warning',
      message: '年間の支出が収入を上回っています。支出の見直しが必要です。',
    });
  }

  // Emergency fund advice
  const emergencyMonths = monthlyExpense > 0 ? (plan.assets.savings + plan.assets.cash) / monthlyExpense : 0;
  if (emergencyMonths >= 6) {
    adviceList.push({
      type: 'success',
      message: `生活防衛資金として約${Math.round(emergencyMonths)}ヶ月分の現預金があります。`,
    });
  } else if (emergencyMonths >= 3) {
    adviceList.push({
      type: 'info',
      message: `現預金は生活費の約${Math.round(emergencyMonths)}ヶ月分です。6ヶ月分を目標にしましょう。`,
    });
  } else {
    adviceList.push({
      type: 'warning',
      message: `現預金が生活費の${Math.round(emergencyMonths)}ヶ月分と少なめです。まず3〜6ヶ月分の確保を優先しましょう。`,
    });
  }

  // Housing cost ratio
  if (totalAnnualIncome > 0) {
    const housingRatio = (plan.expense.housing * 12) / totalAnnualIncome;
    if (housingRatio > 0.3) {
      adviceList.push({
        type: 'warning',
        message: `住居費が年収の${Math.round(housingRatio * 100)}%を占めています。一般的に25〜30%以下が理想です。`,
      });
    }
  }

  // Investment advice
  if (annualInvestment > 0 && annualSavings > 0) {
    adviceList.push({
      type: 'info',
      message: `月${Math.round(plan.investment.monthlyInvestment / 10000)}万円の投資を継続することで、複利効果による資産成長が期待できます。`,
    });
  } else if (annualInvestment === 0 && annualSavings > 0) {
    adviceList.push({
      type: 'info',
      message: '投資積立の設定がありません。余裕資金での長期積立投資を検討してみましょう。',
    });
  }

  // Debt advice
  if (totalDebt > 0 && totalAssets > 0) {
    const debtRatio = totalDebt / totalAssets;
    if (debtRatio > 0.5) {
      adviceList.push({
        type: 'warning',
        message: '負債が総資産の50%を超えています。繰上返済をご検討ください。',
      });
    }
  }

  return adviceList;
}

const typeConfig = {
  success: { icon: '✅', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  warning: { icon: '⚠️', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  info: { icon: '💡', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
};

export default function FinancialAdvice({ plan }: Props) {
  const adviceList = generateAdvice(plan);

  if (adviceList.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-700 mb-4">📋 注意点・簡易アドバイス</h2>
      <div className="space-y-3">
        {adviceList.map((advice, i) => {
          const config = typeConfig[advice.type];
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}
            >
              <span className="text-lg flex-shrink-0">{config.icon}</span>
              <p className={`text-sm ${config.text}`}>{advice.message}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        ※ 上記は一般的な目安に基づく簡易アドバイスです。個別の状況に応じてファイナンシャルプランナーへのご相談もご検討ください。
      </p>
    </div>
  );
}
