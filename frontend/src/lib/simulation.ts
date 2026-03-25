import { LifePlan, SimulationYearData } from './types';

export function runSimulation(plan: LifePlan, years: number = 30): SimulationYearData[] {
  const results: SimulationYearData[] = [];
  const selfAge = plan.household.self.age;
  const spouseAge = plan.household.spouse.age;

  const baseAnnualIncome =
    plan.income.selfAnnualIncome +
    plan.income.spouseAnnualIncome +
    plan.income.selfBonus +
    plan.income.spouseBonus +
    plan.income.sideJobIncome +
    plan.income.otherIncome;

  const monthlyExpense =
    plan.expense.housing +
    plan.expense.food +
    plan.expense.utilities +
    plan.expense.communication +
    plan.expense.insurance +
    plan.expense.car +
    plan.expense.dailyGoods +
    plan.expense.entertainment +
    plan.expense.otherFixed +
    plan.expense.otherVariable;
  const baseAnnualExpense = monthlyExpense * 12 + plan.expense.travel;

  const initialSavings =
    plan.assets.savings + plan.assets.cash + plan.assets.other;
  const initialInvestments =
    plan.assets.securities + plan.assets.nisa + plan.assets.ideco;
  const initialDebt =
    plan.debt.mortgageLoan +
    plan.debt.carLoan +
    plan.debt.studentLoan +
    plan.debt.otherDebt;

  const annualDebtRepayment = plan.debt.mortgageMonthly * 12;
  const annualInvestment = plan.investment.monthlyInvestment * 12;
  const returnRate = plan.investment.expectedReturn / 100;
  const salaryGrowthRate = plan.investment.salaryGrowthRate / 100;
  const inflationRate = plan.investment.inflationRate / 100;
  const pensionMonthly = plan.investment.pensionMonthly;
  const pensionStartAge = plan.investment.pensionStartAge;

  let currentSavings = initialSavings;
  let currentInvestments = initialInvestments;
  let currentDebt = Math.max(0, initialDebt);

  const lifeEvents = plan.lifeEvents ?? [];

  const maxYears = Math.min(years, 100 - selfAge);

  for (let y = 0; y < maxYears; y++) {
    const year = new Date().getFullYear() + y;
    const age = selfAge + y;
    const sAge = spouseAge + y;

    // Calculate life event impacts for this year
    let eventOneTimeCost = 0;
    let eventAnnualCostChange = 0;
    let eventAnnualIncomeChange = 0;
    const eventNames: string[] = [];

    for (const event of lifeEvents) {
      const eventStartYear = event.yearOffset;
      // durationYears: 0 means permanent (ongoing until end of simulation)
      const eventEndYear = event.durationYears > 0
        ? event.yearOffset + event.durationYears - 1
        : maxYears;

      // One-time cost applies only in the start year
      if (y === eventStartYear) {
        eventOneTimeCost += event.oneTimeCost;
        const eventName = (event.name ?? '').trim();
        if (eventName) {
          eventNames.push(eventName);
        }
      }

      // Ongoing changes apply for the duration
      if (y >= eventStartYear && y <= eventEndYear) {
        eventAnnualCostChange += event.annualCostChange;
        eventAnnualIncomeChange += event.annualIncomeChange;
      }
    }

    // Phase 5: apply salary growth and inflation cumulatively
    const growthFactor = Math.pow(1 + salaryGrowthRate, y);
    const inflationFactor = Math.pow(1 + inflationRate, y);
    const pensionIncome = age >= pensionStartAge ? pensionMonthly * 12 : 0;

    const annualIncome = baseAnnualIncome * growthFactor + eventAnnualIncomeChange + pensionIncome;
    const annualExpense = baseAnnualExpense * inflationFactor + eventAnnualCostChange + eventOneTimeCost;

    const investmentGrowth = currentInvestments * returnRate;
    currentInvestments = currentInvestments * (1 + returnRate) + annualInvestment;

    const annualSavings = annualIncome - annualExpense - annualInvestment - annualDebtRepayment;
    currentSavings = currentSavings + annualSavings;

    const debtPaid = Math.min(currentDebt, annualDebtRepayment);
    currentDebt = Math.max(0, currentDebt - debtPaid);

    const totalAssets = Math.max(0, currentSavings) + currentInvestments;
    const netAssets = totalAssets - currentDebt;

    results.push({
      year,
      age,
      spouseAge: sAge,
      annualIncome,
      annualExpense: annualExpense,
      annualSavings,
      investmentGrowth,
      totalAssets,
      totalDebt: currentDebt,
      netAssets,
      savings: Math.max(0, currentSavings),
      investments: currentInvestments,
      events: eventNames,
    });
  }

  return results;
}

export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}億円`;
  }
  if (Math.abs(amount) >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString('ja-JP')}万円`;
  }
  return `${amount.toLocaleString('ja-JP')}円`;
}

export function formatMan(amount: number): string {
  return `${Math.round(amount / 10000).toLocaleString('ja-JP')}万円`;
}
