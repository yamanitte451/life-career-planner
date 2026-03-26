import { render, screen } from '@testing-library/react';
import SummaryCards from '../../components/dashboard/SummaryCards';
import { defaultLifePlan } from '../../lib/storage';

describe('SummaryCards', () => {
  it('4つのカードを表示する', () => {
    render(<SummaryCards current={undefined} plan={defaultLifePlan} />);
    expect(screen.getByText('世帯年収')).toBeInTheDocument();
    expect(screen.getByText('年間支出')).toBeInTheDocument();
    expect(screen.getByText('年間収支')).toBeInTheDocument();
    expect(screen.getByText('純資産（現在）')).toBeInTheDocument();
  });

  it('世帯年収を正しく合算する', () => {
    const plan = {
      ...defaultLifePlan,
      income: {
        selfAnnualIncome: 6000000,
        spouseAnnualIncome: 4000000,
        selfBonus: 1000000,
        spouseBonus: 500000,
        sideJobIncome: 0,
        otherIncome: 0,
      },
    };
    render(<SummaryCards current={undefined} plan={plan} />);
    // 6000000 + 4000000 + 1000000 + 500000 = 11500000 → 1,150万円
    expect(screen.getByText('1,150万円')).toBeInTheDocument();
  });

  it('年間支出 = 月額支出×12 + 旅行費', () => {
    const plan = {
      ...defaultLifePlan,
      expense: {
        housing: 100000,
        food: 50000,
        utilities: 10000,
        communication: 10000,
        insurance: 10000,
        car: 0,
        dailyGoods: 10000,
        entertainment: 10000,
        travel: 300000,
        otherFixed: 0,
        otherVariable: 0,
      },
    };
    render(<SummaryCards current={undefined} plan={plan} />);
    // (100000+50000+10000+10000+10000+0+10000+10000+0+0)*12 + 300000
    // = 200000*12 + 300000 = 2700000 → 270万円
    expect(screen.getByText('270万円')).toBeInTheDocument();
  });

  it('純資産がマイナスの場合も表示する', () => {
    const plan = {
      ...defaultLifePlan,
      assets: { savings: 100000, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: {
        mortgageLoan: 30000000,
        mortgageMonthly: 0,
        mortgageInterestRate: 0,
        mortgageLoanTermYears: 0,
        carLoan: 0,
        studentLoan: 0,
        otherDebt: 0,
      },
    };
    render(<SummaryCards current={undefined} plan={plan} />);
    // 100000 - 30000000 = -29900000 → -2,990万円
    expect(screen.getByText('-2,990万円')).toBeInTheDocument();
  });
});
