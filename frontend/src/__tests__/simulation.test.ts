import { describe, it, expect } from 'vitest';
import { runSimulation, formatCurrency, formatMan } from '../lib/simulation';
import { defaultLifePlan } from '../lib/storage';
import { LifePlan, LifeEvent } from '../lib/types';

function createLifeEvent(overrides: Partial<LifeEvent> = {}): LifeEvent {
  return {
    id: 'test',
    name: '',
    category: 'other',
    yearOffset: 0,
    person: 'household',
    oneTimeCost: 0,
    annualCostChange: 0,
    annualIncomeChange: 0,
    durationYears: 0,
    memo: '',
    ...overrides,
  };
}

describe('runSimulation', () => {
  it('returns correct number of years based on input', () => {
    const results = runSimulation(defaultLifePlan, 10);
    expect(results).toHaveLength(10);
  });

  it('limits years to 100 minus self age', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      household: {
        ...defaultLifePlan.household,
        self: { ...defaultLifePlan.household.self, age: 95 },
      },
    };
    const results = runSimulation(plan, 30);
    expect(results).toHaveLength(5);
  });

  it('first year starts at current year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const currentYear = new Date().getFullYear();
    expect(results[0].year).toBe(currentYear);
  });

  it('ages increment each year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const baseAge = defaultLifePlan.household.self.age;
    results.forEach((row, i) => {
      expect(row.age).toBe(baseAge + i);
    });
  });

  it('spouse ages increment each year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const baseSpouseAge = defaultLifePlan.household.spouse.age;
    results.forEach((row, i) => {
      expect(row.spouseAge).toBe(baseSpouseAge + i);
    });
  });

  it('calculates annual income correctly', () => {
    const results = runSimulation(defaultLifePlan, 1);
    const expectedIncome =
      defaultLifePlan.income.selfAnnualIncome +
      defaultLifePlan.income.spouseAnnualIncome +
      defaultLifePlan.income.selfBonus +
      defaultLifePlan.income.spouseBonus +
      defaultLifePlan.income.sideJobIncome +
      defaultLifePlan.income.otherIncome;
    expect(results[0].annualIncome).toBe(expectedIncome);
  });

  it('investments grow with compound interest', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { ...defaultLifePlan.income, selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 1000000, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 10, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 0, pensionMonthly: 0, pensionStartAge: 65 },
    };
    const results = runSimulation(plan, 2);
    // Year 1: 1000000 * 1.10 = 1100000
    expect(results[0].investments).toBeCloseTo(1100000, 0);
    // Year 2: 1100000 * 1.10 = 1210000
    expect(results[1].investments).toBeCloseTo(1210000, 0);
  });

  it('debt decreases over time', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 10000000, mortgageMonthly: 100000, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 0, pensionMonthly: 0, pensionStartAge: 65 },
    };
    const results = runSimulation(plan, 3);
    // mortgageMonthly * 12 = 1200000/year
    expect(results[0].totalDebt).toBe(10000000 - 1200000);
    expect(results[1].totalDebt).toBe(10000000 - 2400000);
  });

  it('debt does not go below zero', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 500000, mortgageMonthly: 100000, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 0, pensionMonthly: 0, pensionStartAge: 65 },
    };
    const results = runSimulation(plan, 3);
    expect(results[0].totalDebt).toBe(0);
    expect(results[1].totalDebt).toBe(0);
  });

  it('handles zero income and expenses', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 0, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 1000000, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 0, pensionMonthly: 0, pensionStartAge: 65 },
    };
    const results = runSimulation(plan, 5);
    expect(results.length).toBe(5);
    results.forEach((row) => {
      expect(row.totalAssets).toBe(1000000);
      expect(row.annualSavings).toBe(0);
    });
  });

  it('returns empty array if maxYears is zero', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      household: {
        ...defaultLifePlan.household,
        self: { ...defaultLifePlan.household.self, age: 100 },
      },
    };
    const results = runSimulation(plan, 10);
    expect(results).toHaveLength(0);
  });

  it('net assets equals total assets minus total debt', () => {
    const results = runSimulation(defaultLifePlan, 5);
    results.forEach((row) => {
      expect(row.netAssets).toBeCloseTo(row.totalAssets - row.totalDebt, 0);
    });
  });

  it('returns empty events array when no life events', () => {
    const results = runSimulation(defaultLifePlan, 3);
    results.forEach((r) => expect(r.events).toEqual([]));
  });

  describe('life events', () => {
    it('applies one-time cost in the correct year', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 't1', name: '住宅購入', category: 'housing', yearOffset: 2, oneTimeCost: 5000000, durationYears: 1 }),
        ],
      };
      const withEvents = runSimulation(plan, 5);
      const withoutEvents = runSimulation(defaultLifePlan, 5);
      expect(withEvents[0].annualExpense).toBe(withoutEvents[0].annualExpense);
      expect(withEvents[1].annualExpense).toBe(withoutEvents[1].annualExpense);
      expect(withEvents[2].annualExpense).toBe(withoutEvents[2].annualExpense + 5000000);
      expect(withEvents[3].annualExpense).toBe(withoutEvents[3].annualExpense);
    });

    it('applies ongoing cost changes for the duration', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 't2', name: '保育園', category: 'childcare', yearOffset: 1, annualCostChange: 600000, durationYears: 3 }),
        ],
      };
      const withEvents = runSimulation(plan, 6);
      const withoutEvents = runSimulation(defaultLifePlan, 6);
      expect(withEvents[0].annualExpense).toBe(withoutEvents[0].annualExpense);
      expect(withEvents[1].annualExpense).toBe(withoutEvents[1].annualExpense + 600000);
      expect(withEvents[2].annualExpense).toBe(withoutEvents[2].annualExpense + 600000);
      expect(withEvents[3].annualExpense).toBe(withoutEvents[3].annualExpense + 600000);
      expect(withEvents[4].annualExpense).toBe(withoutEvents[4].annualExpense);
    });

    it('applies permanent income changes with durationYears=0', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 't3', name: '転職', category: 'career', yearOffset: 3, person: 'self', annualIncomeChange: 1000000 }),
        ],
      };
      const result = runSimulation(plan, 6);
      const base = runSimulation(defaultLifePlan, 6);
      expect(result[0].annualIncome).toBe(base[0].annualIncome);
      expect(result[2].annualIncome).toBe(base[2].annualIncome);
      expect(result[3].annualIncome).toBe(base[3].annualIncome + 1000000);
      expect(result[5].annualIncome).toBe(base[5].annualIncome + 1000000);
    });

    it('records event names in the correct year', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 't4', name: '出産', category: 'childbirth', yearOffset: 1, oneTimeCost: 500000, annualCostChange: 360000, durationYears: 3 }),
        ],
      };
      const result = runSimulation(plan, 5);
      expect(result[0].events).toEqual([]);
      expect(result[1].events).toEqual(['出産']);
      expect(result[2].events).toEqual([]);
    });

    it('applies event at yearOffset 0 (current year)', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 'y0', name: '即時イベント', yearOffset: 0, oneTimeCost: 1000000, durationYears: 1 }),
        ],
      };
      const result = runSimulation(plan, 3);
      const base = runSimulation(defaultLifePlan, 3);
      expect(result[0].annualExpense).toBe(base[0].annualExpense + 1000000);
      expect(result[0].events).toEqual(['即時イベント']);
      expect(result[1].annualExpense).toBe(base[1].annualExpense);
    });

    it('handles negative income change (retirement)', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 'ret', name: '退職', category: 'retirement', yearOffset: 2, person: 'self', annualIncomeChange: -3000000 }),
        ],
      };
      const result = runSimulation(plan, 5);
      const base = runSimulation(defaultLifePlan, 5);
      expect(result[2].annualIncome).toBe(base[2].annualIncome - 3000000);
      expect(result[4].annualIncome).toBe(base[4].annualIncome - 3000000);
    });

    it('handles multiple events in the same year', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        lifeEvents: [
          createLifeEvent({ id: 'a', name: '転職', category: 'career', yearOffset: 2, person: 'self', annualIncomeChange: 500000 }),
          createLifeEvent({ id: 'b', name: '出産', category: 'childbirth', yearOffset: 2, oneTimeCost: 500000, annualCostChange: 300000, durationYears: 3 }),
        ],
      };
      const result = runSimulation(plan, 5);
      expect(result[2].events).toContain('転職');
      expect(result[2].events).toContain('出産');
      expect(result[2].events).toHaveLength(2);
    });
  });

  describe('Phase 5: salary growth', () => {
    it('applies salary growth rate cumulatively', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        income: { selfAnnualIncome: 1000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
        expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
        assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
        debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
        investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 10, inflationRate: 0, pensionMonthly: 0, pensionStartAge: 65 },
      };
      const results = runSimulation(plan, 3);
      // y=0: 1000000 * 1.1^0 = 1000000
      expect(results[0].annualIncome).toBeCloseTo(1000000, 0);
      // y=1: 1000000 * 1.1^1 = 1100000
      expect(results[1].annualIncome).toBeCloseTo(1100000, 0);
      // y=2: 1000000 * 1.1^2 = 1210000
      expect(results[2].annualIncome).toBeCloseTo(1210000, 0);
    });

    it('zero salary growth rate has no effect', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        investment: { ...defaultLifePlan.investment, salaryGrowthRate: 0 },
      };
      const results = runSimulation(plan, 5);
      const baseIncome = defaultLifePlan.income.selfAnnualIncome + defaultLifePlan.income.spouseAnnualIncome +
        defaultLifePlan.income.selfBonus + defaultLifePlan.income.spouseBonus +
        defaultLifePlan.income.sideJobIncome + defaultLifePlan.income.otherIncome;
      results.forEach((row) => {
        expect(row.annualIncome).toBeCloseTo(baseIncome, 0);
      });
    });
  });

  describe('Phase 5: inflation rate', () => {
    it('applies inflation rate cumulatively to base expenses', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        income: { selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
        expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 100000, otherFixed: 0, otherVariable: 0 },
        assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
        debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
        investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 10, pensionMonthly: 0, pensionStartAge: 65 },
      };
      const results = runSimulation(plan, 3);
      // y=0: 100000 * 1.1^0 = 100000
      expect(results[0].annualExpense).toBeCloseTo(100000, 0);
      // y=1: 100000 * 1.1^1 = 110000
      expect(results[1].annualExpense).toBeCloseTo(110000, 0);
      // y=2: 100000 * 1.1^2 = 121000
      expect(results[2].annualExpense).toBeCloseTo(121000, 0);
    });
  });

  describe('Phase 5: pension income', () => {
    it('adds pension income from pensionStartAge', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        household: {
          ...defaultLifePlan.household,
          self: { ...defaultLifePlan.household.self, age: 63 },
        },
        income: { selfAnnualIncome: 0, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
        expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
        assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
        debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
        investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0, salaryGrowthRate: 0, inflationRate: 0, pensionMonthly: 150000, pensionStartAge: 65 },
      };
      const results = runSimulation(plan, 4);
      // age 63: no pension
      expect(results[0].annualIncome).toBe(0);
      // age 64: no pension
      expect(results[1].annualIncome).toBe(0);
      // age 65: pension starts (150000 * 12 = 1800000)
      expect(results[2].annualIncome).toBe(1800000);
      // age 66: pension continues
      expect(results[3].annualIncome).toBe(1800000);
    });

    it('zero pension monthly has no effect', () => {
      const plan: LifePlan = {
        ...defaultLifePlan,
        investment: { ...defaultLifePlan.investment, pensionMonthly: 0, pensionStartAge: 65 },
      };
      const results = runSimulation(plan, 5);
      const baseIncome = defaultLifePlan.income.selfAnnualIncome + defaultLifePlan.income.spouseAnnualIncome +
        defaultLifePlan.income.selfBonus + defaultLifePlan.income.spouseBonus +
        defaultLifePlan.income.sideJobIncome + defaultLifePlan.income.otherIncome;
      // Year 0, growth factor = 1 (defaultLifePlan has salaryGrowthRate=1%)
      expect(results[0].annualIncome).toBeCloseTo(baseIncome, 0);
    });
  });
});

describe('formatCurrency', () => {
  it('formats oku (100M+) amounts', () => {
    expect(formatCurrency(100000000)).toBe('1.0億円');
    expect(formatCurrency(250000000)).toBe('2.5億円');
  });

  it('formats man (10K+) amounts', () => {
    expect(formatCurrency(10000)).toBe('1万円');
    expect(formatCurrency(50000)).toBe('5万円');
    expect(formatCurrency(10000000)).toBe('1,000万円');
  });

  it('formats small amounts in yen', () => {
    expect(formatCurrency(5000)).toBe('5,000円');
    expect(formatCurrency(100)).toBe('100円');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-200000000)).toBe('-2.0億円');
    expect(formatCurrency(-50000)).toBe('-5万円');
  });
});

describe('formatMan', () => {
  it('formats amounts in man-yen', () => {
    expect(formatMan(10000)).toBe('1万円');
    expect(formatMan(5000000)).toBe('500万円');
    expect(formatMan(10000000)).toBe('1,000万円');
  });

  it('rounds to nearest man', () => {
    expect(formatMan(15000)).toBe('2万円');
    expect(formatMan(14999)).toBe('1万円');
  });
});
