import { describe, it, expect } from 'vitest';
import { runSimulation, formatCurrency, formatMan } from './simulation';
import { LifePlan } from './types';

function createBasePlan(): LifePlan {
  return {
    household: {
      self: { age: 30, name: 'テスト', employmentType: '正社員', jobTitle: '', workplace: '', commuteMinutes: 30, workStyle: '出社' },
      spouse: { age: 28, name: '配偶者', employmentType: '正社員', jobTitle: '', workplace: '', commuteMinutes: 30, workStyle: '出社' },
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
    lifeEvents: [],
  };
}

describe('runSimulation', () => {
  it('returns correct number of years', () => {
    const plan = createBasePlan();
    const result = runSimulation(plan, 10);
    expect(result).toHaveLength(10);
  });

  it('caps years at 100 - selfAge', () => {
    const plan = createBasePlan();
    plan.household.self.age = 90;
    const result = runSimulation(plan, 30);
    expect(result).toHaveLength(10);
  });

  it('calculates correct age progression', () => {
    const plan = createBasePlan();
    const result = runSimulation(plan, 5);
    expect(result[0].age).toBe(30);
    expect(result[4].age).toBe(34);
    expect(result[0].spouseAge).toBe(28);
    expect(result[4].spouseAge).toBe(32);
  });

  it('calculates annual income correctly', () => {
    const plan = createBasePlan();
    const result = runSimulation(plan, 1);
    // 5000000 + 4000000 + 500000 + 400000 + 0 + 0 = 9900000
    expect(result[0].annualIncome).toBe(9900000);
  });

  it('has increasing investments over time with positive return', () => {
    const plan = createBasePlan();
    const result = runSimulation(plan, 10);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].investments).toBeGreaterThan(result[i - 1].investments);
    }
  });

  it('reduces debt over time with monthly payments', () => {
    const plan = createBasePlan();
    plan.debt.mortgageLoan = 30000000;
    plan.debt.mortgageMonthly = 100000;
    const result = runSimulation(plan, 5);
    expect(result[0].totalDebt).toBeLessThan(30000000);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].totalDebt).toBeLessThanOrEqual(result[i - 1].totalDebt);
    }
  });

  it('returns empty events array when no life events', () => {
    const plan = createBasePlan();
    const result = runSimulation(plan, 3);
    result.forEach((r) => expect(r.events).toEqual([]));
  });

  describe('life events', () => {
    it('applies one-time cost in the correct year', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'test1',
          name: '住宅購入',
          category: 'housing',
          yearOffset: 2,
          person: 'household',
          oneTimeCost: 5000000,
          annualCostChange: 0,
          annualIncomeChange: 0,
          durationYears: 1,
          memo: '',
        },
      ];
      const withEvents = runSimulation(plan, 5);
      const withoutEvents = runSimulation({ ...plan, lifeEvents: [] }, 5);

      // Year 0 and 1 should be the same
      expect(withEvents[0].annualExpense).toBe(withoutEvents[0].annualExpense);
      expect(withEvents[1].annualExpense).toBe(withoutEvents[1].annualExpense);

      // Year 2 should have the one-time cost added
      expect(withEvents[2].annualExpense).toBe(withoutEvents[2].annualExpense + 5000000);

      // Year 3 should be back to normal
      expect(withEvents[3].annualExpense).toBe(withoutEvents[3].annualExpense);
    });

    it('applies ongoing cost changes for the duration', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'test2',
          name: '保育園',
          category: 'childcare',
          yearOffset: 1,
          person: 'household',
          oneTimeCost: 0,
          annualCostChange: 600000,
          annualIncomeChange: 0,
          durationYears: 3,
          memo: '',
        },
      ];
      const withEvents = runSimulation(plan, 6);
      const withoutEvents = runSimulation({ ...plan, lifeEvents: [] }, 6);

      // Year 0: no effect
      expect(withEvents[0].annualExpense).toBe(withoutEvents[0].annualExpense);

      // Years 1, 2, 3: +600000 annual cost
      expect(withEvents[1].annualExpense).toBe(withoutEvents[1].annualExpense + 600000);
      expect(withEvents[2].annualExpense).toBe(withoutEvents[2].annualExpense + 600000);
      expect(withEvents[3].annualExpense).toBe(withoutEvents[3].annualExpense + 600000);

      // Year 4: back to normal
      expect(withEvents[4].annualExpense).toBe(withoutEvents[4].annualExpense);
    });

    it('applies permanent income changes with durationYears=0', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'test3',
          name: '転職',
          category: 'career',
          yearOffset: 3,
          person: 'self',
          oneTimeCost: 0,
          annualCostChange: 0,
          annualIncomeChange: 1000000,
          durationYears: 0, // permanent
          memo: '',
        },
      ];
      const result = runSimulation(plan, 6);
      const base = runSimulation({ ...plan, lifeEvents: [] }, 6);

      // Before career change: same income
      expect(result[0].annualIncome).toBe(base[0].annualIncome);
      expect(result[2].annualIncome).toBe(base[2].annualIncome);

      // At career change year and after: income permanently increased
      expect(result[3].annualIncome).toBe(base[3].annualIncome + 1000000);
      expect(result[4].annualIncome).toBe(base[4].annualIncome + 1000000);
      expect(result[5].annualIncome).toBe(base[5].annualIncome + 1000000);
    });

    it('records event names in the correct year', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'test4',
          name: '出産',
          category: 'childbirth',
          yearOffset: 1,
          person: 'household',
          oneTimeCost: 500000,
          annualCostChange: 360000,
          annualIncomeChange: 0,
          durationYears: 3,
          memo: '',
        },
      ];
      const result = runSimulation(plan, 5);
      expect(result[0].events).toEqual([]);
      expect(result[1].events).toEqual(['出産']);
      // Ongoing years should not repeat the name
      expect(result[2].events).toEqual([]);
    });

    it('applies event at yearOffset 0 (current year)', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'test-y0',
          name: '即時イベント',
          category: 'other',
          yearOffset: 0,
          person: 'household',
          oneTimeCost: 1000000,
          annualCostChange: 0,
          annualIncomeChange: 0,
          durationYears: 1,
          memo: '',
        },
      ];
      const result = runSimulation(plan, 3);
      const base = runSimulation({ ...plan, lifeEvents: [] }, 3);
      expect(result[0].annualExpense).toBe(base[0].annualExpense + 1000000);
      expect(result[0].events).toEqual(['即時イベント']);
      expect(result[1].annualExpense).toBe(base[1].annualExpense);
    });

    it('handles negative income change (retirement)', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'retire',
          name: '退職',
          category: 'retirement',
          yearOffset: 2,
          person: 'self',
          oneTimeCost: 0,
          annualCostChange: 0,
          annualIncomeChange: -3000000,
          durationYears: 0, // permanent
          memo: '',
        },
      ];
      const result = runSimulation(plan, 5);
      const base = runSimulation({ ...plan, lifeEvents: [] }, 5);
      expect(result[2].annualIncome).toBe(base[2].annualIncome - 3000000);
      expect(result[4].annualIncome).toBe(base[4].annualIncome - 3000000);
    });

    it('handles event extending beyond simulation horizon', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'long',
          name: '長期イベント',
          category: 'other',
          yearOffset: 8,
          person: 'household',
          oneTimeCost: 0,
          annualCostChange: 100000,
          annualIncomeChange: 0,
          durationYears: 5,
          memo: '',
        },
      ];
      const result = runSimulation(plan, 10);
      const base = runSimulation({ ...plan, lifeEvents: [] }, 10);
      expect(result[8].annualExpense).toBe(base[8].annualExpense + 100000);
      expect(result[9].annualExpense).toBe(base[9].annualExpense + 100000);
    });

    it('handles multiple events in the same year', () => {
      const plan = createBasePlan();
      plan.lifeEvents = [
        {
          id: 'a',
          name: '転職',
          category: 'career',
          yearOffset: 2,
          person: 'self',
          oneTimeCost: 0,
          annualCostChange: 0,
          annualIncomeChange: 500000,
          durationYears: 0,
          memo: '',
        },
        {
          id: 'b',
          name: '出産',
          category: 'childbirth',
          yearOffset: 2,
          person: 'household',
          oneTimeCost: 500000,
          annualCostChange: 300000,
          annualIncomeChange: 0,
          durationYears: 3,
          memo: '',
        },
      ];
      const result = runSimulation(plan, 5);
      expect(result[2].events).toContain('転職');
      expect(result[2].events).toContain('出産');
      expect(result[2].events).toHaveLength(2);
    });
  });
});

describe('formatCurrency', () => {
  it('formats values in 億円 for 100M+', () => {
    expect(formatCurrency(100000000)).toBe('1.0億円');
    expect(formatCurrency(250000000)).toBe('2.5億円');
  });

  it('formats values in 万円 for 10K+', () => {
    expect(formatCurrency(10000)).toBe('1万円');
    expect(formatCurrency(50000)).toBe('5万円');
    expect(formatCurrency(9900000)).toBe('990万円');
  });

  it('formats small values in 円', () => {
    expect(formatCurrency(500)).toBe('500円');
    expect(formatCurrency(9999)).toBe('9,999円');
  });
});

describe('formatMan', () => {
  it('formats values in 万円', () => {
    expect(formatMan(10000)).toBe('1万円');
    expect(formatMan(5000000)).toBe('500万円');
  });
});
