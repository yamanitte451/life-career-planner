import { LifePlan } from './types';

const STORAGE_KEY = 'life_career_plan';

export const defaultLifePlan: LifePlan = {
  household: {
    self: {
      age: 30,
      name: '',
      employmentType: '正社員',
      jobTitle: '',
      workplace: '',
      commuteMinutes: 30,
      workStyle: '出社',
    },
    spouse: {
      age: 28,
      name: '',
      employmentType: '正社員',
      jobTitle: '',
      workplace: '',
      commuteMinutes: 30,
      workStyle: '出社',
    },
    residenceArea: '東京都',
    familyComposition: '夫婦のみ',
    hasChildren: false,
  },
  income: {
    selfAnnualIncome: 5000000,
    spouseAnnualIncome: 4000000,
    selfBonus: 500000,
    spouseBonus: 400000,
    sideJobIncome: 0,
    otherIncome: 0,
  },
  expense: {
    housing: 100000,
    food: 60000,
    utilities: 15000,
    communication: 10000,
    insurance: 20000,
    car: 0,
    dailyGoods: 10000,
    entertainment: 20000,
    travel: 200000,
    otherFixed: 10000,
    otherVariable: 20000,
  },
  assets: {
    savings: 3000000,
    securities: 1000000,
    nisa: 500000,
    ideco: 300000,
    cash: 200000,
    other: 0,
  },
  debt: {
    mortgageLoan: 0,
    mortgageMonthly: 0,
    carLoan: 0,
    studentLoan: 0,
    otherDebt: 0,
  },
  investment: {
    monthlyInvestment: 50000,
    expectedReturn: 5,
    nisaMonthly: 30000,
    idecoMonthly: 23000,
  },
};

export function savePlan(plan: LifePlan): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }
}

export function loadPlan(): LifePlan {
  if (typeof window === 'undefined') return defaultLifePlan;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultLifePlan;
  try {
    return { ...defaultLifePlan, ...JSON.parse(stored) };
  } catch {
    return defaultLifePlan;
  }
}
