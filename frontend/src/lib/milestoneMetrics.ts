import { SimulationYearData } from './types';

export interface MilestoneMetrics {
  netAssetsAt60: number | null;
  peakExpenseYear: { year: number; age: number; amount: number };
  peakEducationYear: { year: number; age: number; amount: number } | null;
  negativeNetAssetsYear: { year: number; age: number } | null;
  lifetimeBalance: number;
}

export function calcMilestoneMetrics(
  data: SimulationYearData[],
  selfAge: number
): MilestoneMetrics {
  if (data.length === 0) {
    return {
      netAssetsAt60: null,
      peakExpenseYear: { year: new Date().getFullYear(), age: selfAge, amount: 0 },
      peakEducationYear: null,
      negativeNetAssetsYear: null,
      lifetimeBalance: 0,
    };
  }

  // 60歳時点の純資産
  const at60 = data.find((d) => d.age === 60);
  const netAssetsAt60 = at60 ? at60.netAssets : null;

  // 支出ピーク年
  let peakExpenseYear = { year: data[0].year, age: data[0].age, amount: data[0].annualExpense };
  for (const d of data) {
    if (d.annualExpense > peakExpenseYear.amount) {
      peakExpenseYear = { year: d.year, age: d.age, amount: d.annualExpense };
    }
  }

  // 教育費ピーク年
  let peakEducationYear: MilestoneMetrics['peakEducationYear'] = null;
  for (const d of data) {
    if (d.annualEducationExpense > 0) {
      if (!peakEducationYear || d.annualEducationExpense > peakEducationYear.amount) {
        peakEducationYear = { year: d.year, age: d.age, amount: d.annualEducationExpense };
      }
    }
  }

  // 純資産がマイナスになる最初の年
  const negRow = data.find((d) => d.netAssets < 0);
  const negativeNetAssetsYear = negRow ? { year: negRow.year, age: negRow.age } : null;

  // 生涯収支バランス（累計）
  const lifetimeBalance = data.reduce((sum, d) => sum + d.annualSavings, 0);

  return {
    netAssetsAt60,
    peakExpenseYear,
    peakEducationYear,
    negativeNetAssetsYear,
    lifetimeBalance,
  };
}
