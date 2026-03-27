import { describe, it, expect } from 'vitest';
import { calcMilestoneMetrics } from '../lib/milestoneMetrics';
import { SimulationYearData } from '../lib/types';

function makeRow(overrides: Partial<SimulationYearData> & { year: number; age: number }): SimulationYearData {
  return {
    spouseAge: overrides.age - 2,
    annualIncome: 5000000,
    annualExpense: 4000000,
    annualSavings: 1000000,
    investmentGrowth: 0,
    totalAssets: 10000000,
    totalDebt: 0,
    netAssets: 10000000,
    savings: 5000000,
    investments: 5000000,
    events: [],
    annualTax: 0,
    annualEducationExpense: 0,
    ...overrides,
  };
}

describe('calcMilestoneMetrics', () => {
  it('60歳時点の純資産を返す', () => {
    const data = [
      makeRow({ year: 2026, age: 58, netAssets: 20000000 }),
      makeRow({ year: 2027, age: 59, netAssets: 22000000 }),
      makeRow({ year: 2028, age: 60, netAssets: 25000000 }),
      makeRow({ year: 2029, age: 61, netAssets: 24000000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.netAssetsAt60).toBe(25000000);
  });

  it('60歳に到達しない場合はnull', () => {
    const data = [
      makeRow({ year: 2026, age: 30 }),
      makeRow({ year: 2027, age: 31 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.netAssetsAt60).toBeNull();
  });

  it('支出ピーク年を正しく検出する', () => {
    const data = [
      makeRow({ year: 2026, age: 35, annualExpense: 4000000 }),
      makeRow({ year: 2027, age: 36, annualExpense: 6000000 }),
      makeRow({ year: 2028, age: 37, annualExpense: 5000000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.peakExpenseYear).toEqual({ year: 2027, age: 36, amount: 6000000 });
  });

  it('教育費ピーク年を正しく検出する', () => {
    const data = [
      makeRow({ year: 2026, age: 40, annualEducationExpense: 0 }),
      makeRow({ year: 2027, age: 41, annualEducationExpense: 1200000 }),
      makeRow({ year: 2028, age: 42, annualEducationExpense: 800000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.peakEducationYear).toEqual({ year: 2027, age: 41, amount: 1200000 });
  });

  it('子どもがいない場合、教育費ピーク年はnull', () => {
    const data = [
      makeRow({ year: 2026, age: 30, annualEducationExpense: 0 }),
      makeRow({ year: 2027, age: 31, annualEducationExpense: 0 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.peakEducationYear).toBeNull();
  });

  it('純資産マイナスの最初の年を検出する', () => {
    const data = [
      makeRow({ year: 2026, age: 50, netAssets: 5000000 }),
      makeRow({ year: 2027, age: 51, netAssets: -100000 }),
      makeRow({ year: 2028, age: 52, netAssets: -500000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.negativeNetAssetsYear).toEqual({ year: 2027, age: 51 });
  });

  it('純資産がマイナスにならない場合はnull', () => {
    const data = [
      makeRow({ year: 2026, age: 30, netAssets: 5000000 }),
      makeRow({ year: 2027, age: 31, netAssets: 6000000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.negativeNetAssetsYear).toBeNull();
  });

  it('生涯収支バランスを計算する', () => {
    const data = [
      makeRow({ year: 2026, age: 30, annualSavings: 1000000 }),
      makeRow({ year: 2027, age: 31, annualSavings: -500000 }),
      makeRow({ year: 2028, age: 32, annualSavings: 2000000 }),
    ];
    const m = calcMilestoneMetrics(data);
    expect(m.lifetimeBalance).toBe(2500000);
  });
});
