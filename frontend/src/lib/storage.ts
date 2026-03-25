import { LifePlan, Scenario } from './types';

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
    salaryGrowthRate: 1,
    inflationRate: 1,
    pensionMonthly: 150000,
    pensionStartAge: 65,
  },
  lifeEvents: [],
};

export function savePlan(plan: LifePlan): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T extends Record<string, any>>(defaults: T, stored: any): T {
  if (!stored || typeof stored !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const defaultVal = defaults[key];
    const storedVal = stored[key];
    if (storedVal === undefined || storedVal === null) continue;
    if (Array.isArray(defaultVal)) {
      (result as Record<string, unknown>)[key as string] = Array.isArray(storedVal) ? storedVal : defaultVal;
    } else if (typeof defaultVal === 'object' && defaultVal !== null && !Array.isArray(defaultVal)) {
      (result as Record<string, unknown>)[key as string] = deepMerge(defaultVal as Record<string, unknown>, storedVal);
    } else {
      (result as Record<string, unknown>)[key as string] = storedVal;
    }
  }
  return result;
}

export const SCENARIOS_KEY = 'life_career_scenarios';

function writeScenariosToStorage(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios));
  } catch (error) {
    // Fail gracefully if localStorage is unavailable or quota is exceeded
    // eslint-disable-next-line no-console
    console.error('Failed to save scenarios to localStorage:', error);
  }
}

export function saveScenario(scenario: Scenario): void {
  if (typeof window === 'undefined') return;
  const scenarios = loadScenarios();
  const existingIndex = scenarios.findIndex((s) => s.id === scenario.id);
  if (existingIndex >= 0) {
    scenarios[existingIndex] = scenario;
  } else {
    scenarios.push(scenario);
  }
  writeScenariosToStorage(scenarios);
}

export function loadScenarios(): Scenario[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SCENARIOS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const scenarios: Scenario[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id, name, createdAt, plan } = item as any;
      if (typeof id !== 'string' || typeof name !== 'string' || typeof createdAt !== 'number') continue;
      const mergedPlan = deepMerge(defaultLifePlan, typeof plan === 'object' && plan !== null ? plan : {});
      scenarios.push({ id, name, createdAt, plan: mergedPlan });
    }
    return scenarios;
  } catch {
    return [];
  }
}

export function deleteScenario(id: string): void {
  if (typeof window === 'undefined') return;
  const scenarios = loadScenarios().filter((s) => s.id !== id);
  writeScenariosToStorage(scenarios);
}

export function loadPlan(): LifePlan {
  if (typeof window === 'undefined') return defaultLifePlan;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultLifePlan;
  try {
    const parsed = JSON.parse(stored);
    return deepMerge(defaultLifePlan, parsed);
  } catch {
    return defaultLifePlan;
  }
}
