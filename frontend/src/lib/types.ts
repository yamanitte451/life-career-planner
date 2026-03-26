export interface Person {
  age: number;
  name: string;
  employmentType: string;
  jobTitle: string;
  workplace: string;
  commuteMinutes: number;
  workStyle: string;
}

export type SchoolType = 'public' | 'private';
export type UniversityType = 'none' | 'national' | 'private_arts' | 'private_science';

export interface ChildInfo {
  id: string;
  name: string;
  birthYearOffset: number; // 0=今年生まれ, -3=3年前生まれ(現在3歳), 5=5年後生まれ
  kindergartenType: SchoolType;
  elementaryType: SchoolType;
  juniorHighType: SchoolType;
  highSchoolType: SchoolType;
  universityType: UniversityType;
  livesAwayForUniversity: boolean;
}

export interface HouseholdProfile {
  self: Person;
  spouse: Person;
  residenceArea: string;
  familyComposition: string;
  hasChildren: boolean;
  children: ChildInfo[];
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
  mortgageInterestRate: number; // 年利(%), e.g. 1.5。0=金利なし（元金均等簡易計算）
  mortgageLoanTermYears: number; // 残存返済期間（年）。0=手動入力
  carLoan: number;
  studentLoan: number;
  otherDebt: number;
}

export interface InvestmentPlan {
  monthlyInvestment: number;
  expectedReturn: number;
  nisaMonthly: number;
  idecoMonthly: number;
  salaryGrowthRate: number; // annual salary growth rate (%)
  inflationRate: number; // annual expense inflation rate (%)
  pensionMonthly: number; // monthly pension income (yen)
  pensionStartAge: number; // age at which pension starts
  enableTaxCalculation: boolean; // 税金・社会保険料の自動計算
}

export type LifeEventCategory =
  | 'marriage'
  | 'childbirth'
  | 'childcare'
  | 'education'
  | 'housing'
  | 'car'
  | 'career'
  | 'retirement'
  | 'other';

export interface LifeEvent {
  id: string;
  name: string;
  category: LifeEventCategory;
  yearOffset: number; // years from now (0 = this year)
  person: 'self' | 'spouse' | 'household';
  oneTimeCost: number;
  annualCostChange: number; // ongoing annual expense change (positive = increase)
  annualIncomeChange: number; // ongoing annual income change (positive = increase)
  durationYears: number; // how many years the ongoing changes last (0 = permanent)
  memo: string;
}

export interface LifePlan {
  household: HouseholdProfile;
  income: IncomePlan;
  expense: ExpensePlan;
  assets: AssetAccount;
  debt: DebtPlan;
  investment: InvestmentPlan;
  lifeEvents: LifeEvent[];
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: number;
  plan: LifePlan;
}

// --- AI Chat types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface AIChatConfig {
  provider: 'openai';
  apiKey: string;
  model: string;
}

// --- Simulation types ---

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
  events: string[]; // names of life events occurring this year
  annualTax: number; // 税金・社会保険料合計 (enableTaxCalculation=false の場合は 0)
  annualEducationExpense: number; // 教育費合計 (children配列から算出)
}
