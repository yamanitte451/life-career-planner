export interface Person {
  age: number;
  name: string;
  employmentType: string;
  jobTitle: string;
  workplace: string;
  commuteMinutes: number;
  workStyle: string;
}

export interface HouseholdProfile {
  self: Person;
  spouse: Person;
  residenceArea: string;
  familyComposition: string;
  hasChildren: boolean;
}

export interface IncomePlan {
  selfAnnualIncome: number;
  spouseAnnualIncome: number;
  selfBonus: number;
  spouseBonus: number;
  sideJobIncome: number;
  otherIncome: number;
}

export interface ExpensePlan {
  housing: number;
  food: number;
  utilities: number;
  communication: number;
  insurance: number;
  car: number;
  dailyGoods: number;
  entertainment: number;
  travel: number;
  otherFixed: number;
  otherVariable: number;
}

export interface AssetAccount {
  savings: number;
  securities: number;
  nisa: number;
  ideco: number;
  cash: number;
  other: number;
}

export interface DebtPlan {
  mortgageLoan: number;
  mortgageMonthly: number;
  carLoan: number;
  studentLoan: number;
  otherDebt: number;
}

export interface InvestmentPlan {
  monthlyInvestment: number;
  expectedReturn: number;
  nisaMonthly: number;
  idecoMonthly: number;
}

export interface LifePlan {
  household: HouseholdProfile;
  income: IncomePlan;
  expense: ExpensePlan;
  assets: AssetAccount;
  debt: DebtPlan;
  investment: InvestmentPlan;
}

export interface SimulationYearData {
  year: number;
  age: number;
  spouseAge: number;
  annualIncome: number;
  annualExpense: number;
  annualSavings: number;
  investmentGrowth: number;
  totalAssets: number;
  totalDebt: number;
  netAssets: number;
  savings: number;
  investments: number;
}
