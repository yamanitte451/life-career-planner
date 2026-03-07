'use client';
import { SimulationYearData } from '../../lib/types';
import { formatMan } from '../../lib/simulation';

interface Props {
  current: SimulationYearData | undefined;
  plan: {
    income: { selfAnnualIncome: number; spouseAnnualIncome: number; selfBonus: number; spouseBonus: number; sideJobIncome: number; otherIncome: number };
    expense: { housing: number; food: number; utilities: number; communication: number; insurance: number; car: number; dailyGoods: number; entertainment: number; travel: number; otherFixed: number; otherVariable: number };
    assets: { savings: number; securities: number; nisa: number; ideco: number; cash: number; other: number };
    debt: { mortgageLoan: number; carLoan: number; studentLoan: number; otherDebt: number };
  };
}

export default function SummaryCards({ current, plan }: Props) {
  const totalAnnualIncome =
    plan.income.selfAnnualIncome + plan.income.spouseAnnualIncome +
    plan.income.selfBonus + plan.income.spouseBonus +
    plan.income.sideJobIncome + plan.income.otherIncome;

  const monthlyExpense =
    plan.expense.housing + plan.expense.food + plan.expense.utilities +
    plan.expense.communication + plan.expense.insurance + plan.expense.car +
    plan.expense.dailyGoods + plan.expense.entertainment +
    plan.expense.otherFixed + plan.expense.otherVariable;
  const annualExpense = monthlyExpense * 12 + plan.expense.travel;

  const totalAssets =
    plan.assets.savings + plan.assets.securities + plan.assets.nisa +
    plan.assets.ideco + plan.assets.cash + plan.assets.other;

  const totalDebt =
    plan.debt.mortgageLoan + plan.debt.carLoan +
    plan.debt.studentLoan + plan.debt.otherDebt;

  const annualBalance = totalAnnualIncome - annualExpense;
  const netAssets = totalAssets - totalDebt;

  const cards = [
    {
      label: '世帯年収',
      value: formatMan(totalAnnualIncome),
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      icon: '💰',
    },
    {
      label: '年間支出',
      value: formatMan(annualExpense),
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      icon: '🛒',
    },
    {
      label: '年間収支',
      value: formatMan(annualBalance),
      color: annualBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
      textColor: annualBalance >= 0 ? 'text-green-700' : 'text-red-700',
      icon: annualBalance >= 0 ? '📈' : '📉',
    },
    {
      label: '純資産（現在）',
      value: formatMan(netAssets),
      color: netAssets >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200',
      textColor: netAssets >= 0 ? 'text-indigo-700' : 'text-red-700',
      icon: '🏦',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <p className="text-xs text-gray-500 mb-1">{c.label}</p>
          <p className={`text-xl font-bold ${c.textColor}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
