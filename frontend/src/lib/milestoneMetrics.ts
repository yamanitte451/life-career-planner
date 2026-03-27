import { SimulationYearData } from './types';

export interface MilestoneMetrics {
  netAssetsAt60: number | null;
  peakExpenseYear: { year: number; age: number; amount: number } | null;
  peakEducationYear: { year: number; age: number; amount: number } | null;
  negativeNetAssetsYear: { year: number; age: number } | null;
  /** 入力データ配列の期間累計収支（annualSavings の合計）。30年固定シミュレーションで使用する場合は30年累計になる。 */
  lifetimeBalance: number;
}

export function calcMilestoneMetrics(data: SimulationYearData[]): MilestoneMetrics {
  if (data.length === 0) {
    return {
      netAssetsAt60: null,
      peakExpenseYear: null,
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

  // 収支バランス（入力配列の期間累計）
  const lifetimeBalance = data.reduce((sum, d) => sum + d.annualSavings, 0);

  return {
    netAssetsAt60,
    peakExpenseYear,
    peakEducationYear,
    negativeNetAssetsYear,
    lifetimeBalance,
  };
}
