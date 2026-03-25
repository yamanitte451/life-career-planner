import { ChildInfo, LifePlan, SimulationYearData } from './types';

// ─── 税金・社会保険料計算 ──────────────────────────────────────────────────────

/** 給与所得控除（令和6年度） */
function calcEmploymentIncomeDeduction(salary: number): number {
  if (salary <= 1625000) return 550000;
  if (salary <= 1800000) return Math.floor(salary * 0.4 - 100000);
  if (salary <= 3600000) return Math.floor(salary * 0.3 + 80000);
  if (salary <= 6600000) return Math.floor(salary * 0.2 + 440000);
  if (salary <= 8500000) return Math.floor(salary * 0.1 + 1100000);
  return 1950000;
}

/** 所得税（復興特別所得税 2.1% 込み） */
function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax: number;
  if (taxableIncome <= 1950000) tax = taxableIncome * 0.05;
  else if (taxableIncome <= 3300000) tax = taxableIncome * 0.10 - 97500;
  else if (taxableIncome <= 6950000) tax = taxableIncome * 0.20 - 427500;
  else if (taxableIncome <= 9000000) tax = taxableIncome * 0.23 - 636000;
  else if (taxableIncome <= 18000000) tax = taxableIncome * 0.33 - 1536000;
  else if (taxableIncome <= 40000000) tax = taxableIncome * 0.40 - 2796000;
  else tax = taxableIncome * 0.45 - 4796000;
  return Math.floor(Math.max(0, tax) * 1.021);
}

/**
 * 一人分の年間税・社会保険料合計（簡易計算）
 * - 社会保険料: 健康保険 5% + 厚生年金 9.15% + 雇用保険 0.6% ≈ 14.75%
 * - 配偶者控除: 配偶者所得が 103 万以下の場合 38 万控除
 * - 基礎控除: 48 万円
 */
export function calculatePersonAnnualTax(salary: number, spouseIncome: number): number {
  if (salary <= 0) return 0;
  const socialInsurance = Math.floor(salary * 0.1475);
  const employmentDeduction = calcEmploymentIncomeDeduction(salary);
  const employmentIncome = Math.max(0, salary - employmentDeduction);
  const spouseDeduction = spouseIncome < 1030000 ? 380000 : 0;
  const taxableIncome = Math.max(0, employmentIncome - socialInsurance - 480000 - spouseDeduction);
  const incomeTax = calcIncomeTax(taxableIncome);
  const residentTax = Math.max(0, Math.floor(taxableIncome * 0.10) + 5000);
  return socialInsurance + incomeTax + residentTax;
}

// ─── 住宅ローン計算 ──────────────────────────────────────────────────────────

/**
 * 元利均等返済の月返済額
 * @param principal 残高（円）
 * @param annualRatePercent 年利（%）
 * @param termYears 残存期間（年）
 */
export function calculateMortgageMonthly(
  principal: number,
  annualRatePercent: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  if (annualRatePercent <= 0) {
    // 無利子: 元金を均等分割
    return Math.ceil(principal / (termYears * 12));
  }
  const r = annualRatePercent / 100 / 12;
  const n = termYears * 12;
  return Math.ceil((principal * r) / (1 - Math.pow(1 + r, -n)));
}

// ─── 教育費計算 ──────────────────────────────────────────────────────────────

/** 文科省「子供の学習費調査」参考の年間費用（概算） */
const EDUCATION_COSTS = {
  kindergarten: { public: 161000, private: 308000 }, // 3〜5歳
  elementary:   { public: 353000, private: 1667000 }, // 6〜11歳
  juniorHigh:   { public: 538000, private: 1436000 }, // 12〜14歳
  highSchool:   { public: 513000, private: 1054000 }, // 15〜17歳
  university: {
    none: 0,
    national: 547000,       // 国公立大学
    private_arts: 930000,   // 私立文系
    private_science: 1200000, // 私立理系
  },
} as const;

const UNIVERSITY_AWAY_COST = 1000000; // 自宅外通学の追加費用（仕送り等）

function calcChildEducationCost(child: ChildInfo, childAge: number): number {
  if (childAge < 3 || childAge > 21) return 0;
  if (childAge <= 5)  return EDUCATION_COSTS.kindergarten[child.kindergartenType];
  if (childAge <= 11) return EDUCATION_COSTS.elementary[child.elementaryType];
  if (childAge <= 14) return EDUCATION_COSTS.juniorHigh[child.juniorHighType];
  if (childAge <= 17) return EDUCATION_COSTS.highSchool[child.highSchoolType];
  // 18〜21: 大学
  const base = EDUCATION_COSTS.university[child.universityType];
  return base + (child.livesAwayForUniversity ? UNIVERSITY_AWAY_COST : 0);
}

// ─── メインシミュレーション ─────────────────────────────────────────────────

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

  // 住宅ローン月返済額: 詳細パラメータが揃っていれば自動計算、なければ手動値を使用
  const mortgageMonthly =
    plan.debt.mortgageLoan > 0 && plan.debt.mortgageLoanTermYears > 0
      ? calculateMortgageMonthly(plan.debt.mortgageLoan, plan.debt.mortgageInterestRate, plan.debt.mortgageLoanTermYears)
      : plan.debt.mortgageMonthly;

  const annualDebtRepayment = mortgageMonthly * 12;
  const annualInvestment = plan.investment.monthlyInvestment * 12;
  const returnRate = plan.investment.expectedReturn / 100;
  const salaryGrowthRate = plan.investment.salaryGrowthRate / 100;
  const inflationRate = plan.investment.inflationRate / 100;
  const pensionMonthly = plan.investment.pensionMonthly;
  const pensionStartAge = plan.investment.pensionStartAge;
  const enableTax = plan.investment.enableTaxCalculation;

  let currentSavings = initialSavings;
  let currentInvestments = initialInvestments;
  let currentDebt = Math.max(0, initialDebt);

  const lifeEvents = plan.lifeEvents;
  const children = plan.household.children ?? [];

  const maxYears = Math.min(years, 100 - selfAge);

  for (let y = 0; y < maxYears; y++) {
    const year = new Date().getFullYear() + y;
    const age = selfAge + y;
    const sAge = spouseAge + y;

    let eventOneTimeCost = 0;
    let eventAnnualCostChange = 0;
    let eventAnnualIncomeChange = 0;
    const eventNames: string[] = [];

    for (const event of lifeEvents) {
      const eventStartYear = event.yearOffset;
      const eventEndYear = event.durationYears > 0
        ? event.yearOffset + event.durationYears - 1
        : maxYears;

      if (y === eventStartYear) {
        eventOneTimeCost += event.oneTimeCost;
        const eventName = (event.name ?? '').trim();
        if (eventName) {
          eventNames.push(eventName);
        }
      }

      if (y >= eventStartYear && y <= eventEndYear) {
        eventAnnualCostChange += event.annualCostChange;
        eventAnnualIncomeChange += event.annualIncomeChange;
      }
    }

    // 昇給率・物価上昇率
    const growthFactor = Math.pow(1 + salaryGrowthRate, y);
    const inflationFactor = Math.pow(1 + inflationRate, y);
    const pensionIncome = age >= pensionStartAge ? pensionMonthly * 12 : 0;

    const annualIncome = baseAnnualIncome * growthFactor + eventAnnualIncomeChange + pensionIncome;

    // 税金・社会保険料の計算
    let annualTax = 0;
    if (enableTax) {
      const selfSalary = (plan.income.selfAnnualIncome + plan.income.selfBonus) * growthFactor;
      const spouseSalary = (plan.income.spouseAnnualIncome + plan.income.spouseBonus) * growthFactor;
      annualTax =
        calculatePersonAnnualTax(selfSalary, spouseSalary) +
        calculatePersonAnnualTax(spouseSalary, selfSalary);
    }

    // 教育費の計算
    let annualEducationExpense = 0;
    for (const child of children) {
      const childAge = y - child.birthYearOffset;
      annualEducationExpense += calcChildEducationCost(child, childAge);
    }

    const annualExpense =
      baseAnnualExpense * inflationFactor +
      eventAnnualCostChange +
      eventOneTimeCost +
      annualEducationExpense;

    const investmentGrowth = currentInvestments * returnRate;
    currentInvestments = currentInvestments * (1 + returnRate) + annualInvestment;

    const annualSavings =
      annualIncome - annualTax - annualExpense - annualInvestment - annualDebtRepayment;
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
      annualExpense,
      annualSavings,
      investmentGrowth,
      totalAssets,
      totalDebt: currentDebt,
      netAssets,
      savings: Math.max(0, currentSavings),
      investments: currentInvestments,
      events: eventNames,
      annualTax,
      annualEducationExpense,
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
