import { render, screen } from '@testing-library/react';
import FinancialAdvice, { generateAdvice } from '../../components/dashboard/FinancialAdvice';
import { defaultLifePlan } from '../../lib/storage';
import { LifePlan } from '../../lib/types';

function planWith(overrides: Partial<LifePlan>): LifePlan {
  return { ...defaultLifePlan, ...overrides };
}

describe('generateAdvice', () => {
  it('貯蓄率20%以上で成功アドバイスを返す', () => {
    const plan = planWith({
      income: { ...defaultLifePlan.income, selfAnnualIncome: 10000000 },
      expense: {
        ...defaultLifePlan.expense,
        housing: 50000,
        food: 30000,
        utilities: 5000,
        communication: 5000,
        insurance: 5000,
        car: 0,
        dailyGoods: 5000,
        entertainment: 5000,
        otherFixed: 0,
        otherVariable: 0,
        travel: 0,
      },
    });
    const advice = generateAdvice(plan);
    const savingsAdvice = advice.find((a) => a.message.includes('貯蓄率'));
    expect(savingsAdvice?.type).toBe('success');
  });

  it('支出超過で警告アドバイスを返す', () => {
    const plan = planWith({
      income: {
        selfAnnualIncome: 1000000,
        spouseAnnualIncome: 0,
        selfBonus: 0,
        spouseBonus: 0,
        sideJobIncome: 0,
        otherIncome: 0,
      },
      expense: {
        housing: 200000,
        food: 100000,
        utilities: 30000,
        communication: 20000,
        insurance: 20000,
        car: 20000,
        dailyGoods: 20000,
        entertainment: 20000,
        travel: 0,
        otherFixed: 0,
        otherVariable: 0,
      },
    });
    const advice = generateAdvice(plan);
    const deficit = advice.find((a) => a.message.includes('支出が収入を上回'));
    expect(deficit).toBeDefined();
    expect(deficit?.type).toBe('warning');
  });

  it('生活防衛資金6ヶ月以上で成功アドバイスを返す', () => {
    const plan = planWith({
      assets: {
        savings: 5000000,
        securities: 0,
        nisa: 0,
        ideco: 0,
        cash: 0,
        other: 0,
      },
    });
    const advice = generateAdvice(plan);
    const emergency = advice.find((a) => a.message.includes('生活防衛資金'));
    expect(emergency?.type).toBe('success');
  });

  it('住居費が年収の30%超で警告を返す', () => {
    const plan = planWith({
      income: {
        selfAnnualIncome: 3000000,
        spouseAnnualIncome: 0,
        selfBonus: 0,
        spouseBonus: 0,
        sideJobIncome: 0,
        otherIncome: 0,
      },
      expense: {
        ...defaultLifePlan.expense,
        housing: 100000, // 1200000/3000000 = 40%
      },
    });
    const advice = generateAdvice(plan);
    const housingAdvice = advice.find((a) => a.message.includes('住居費'));
    expect(housingAdvice?.type).toBe('warning');
  });

  it('負債が総資産の50%超で警告を返す', () => {
    const plan = planWith({
      assets: { savings: 1000000, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: {
        mortgageLoan: 600000,
        mortgageMonthly: 0,
        mortgageInterestRate: 0,
        mortgageLoanTermYears: 0,
        carLoan: 0,
        studentLoan: 0,
        otherDebt: 0,
      },
    });
    const advice = generateAdvice(plan);
    const debtAdvice = advice.find((a) => a.message.includes('負債'));
    expect(debtAdvice?.type).toBe('warning');
  });
});

describe('FinancialAdvice コンポーネント', () => {
  it('アドバイスリストを描画する', () => {
    render(<FinancialAdvice plan={defaultLifePlan} />);
    expect(screen.getByText('📋 注意点・簡易アドバイス')).toBeInTheDocument();
  });

  it('免責事項を表示する', () => {
    render(<FinancialAdvice plan={defaultLifePlan} />);
    expect(screen.getByText(/一般的な目安に基づく簡易アドバイス/)).toBeInTheDocument();
  });
});
