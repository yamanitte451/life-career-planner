import { AIProposal, LifePlan } from './types';

/** 許可するパスのホワイトリスト */
const ALLOWED_PATHS = new Set([
  // income
  'income.selfAnnualIncome',
  'income.spouseAnnualIncome',
  'income.selfBonus',
  'income.spouseBonus',
  'income.sideJobIncome',
  'income.otherIncome',
  // expense
  'expense.housing',
  'expense.food',
  'expense.utilities',
  'expense.communication',
  'expense.insurance',
  'expense.car',
  'expense.dailyGoods',
  'expense.entertainment',
  'expense.travel',
  'expense.otherFixed',
  'expense.otherVariable',
  // investment
  'investment.monthlyInvestment',
  'investment.expectedReturn',
  'investment.nisaMonthly',
  'investment.idecoMonthly',
  'investment.salaryGrowthRate',
  'investment.inflationRate',
  'investment.pensionMonthly',
  'investment.pensionStartAge',
  // debt
  'debt.mortgageLoan',
  'debt.mortgageMonthly',
  'debt.mortgageInterestRate',
  'debt.mortgageLoanTermYears',
  'debt.carLoan',
  'debt.studentLoan',
  'debt.otherDebt',
  // assets
  'assets.savings',
  'assets.securities',
  'assets.nisa',
  'assets.ideco',
  'assets.cash',
  'assets.other',
]);

/**
 * AIの提案をLifePlanに適用するための更新オブジェクトを生成する。
 * updatePlan(Partial<LifePlan>) に渡せる形式で返す。
 */
export function applyProposalToPlan(
  plan: LifePlan,
  proposal: AIProposal
): Partial<LifePlan> {
  const updates: Record<string, Record<string, unknown>> = {};

  for (const change of proposal.changes) {
    if (!ALLOWED_PATHS.has(change.path)) continue;
    if (typeof change.value !== 'number' || !isFinite(change.value)) continue;

    const [section, field] = change.path.split('.');
    if (!section || !field) continue;

    if (!updates[section]) {
      // 既存のセクションデータをコピー
      updates[section] = { ...(plan[section as keyof LifePlan] as unknown as Record<string, unknown>) };
    }
    updates[section][field] = change.value;
  }

  return updates as Partial<LifePlan>;
}

/** パスのラベル一覧（システムプロンプト用） */
export const PATH_LABELS: Record<string, string> = {
  'income.selfAnnualIncome': '本人年収',
  'income.spouseAnnualIncome': '配偶者年収',
  'income.selfBonus': '本人賞与',
  'income.spouseBonus': '配偶者賞与',
  'income.sideJobIncome': '副業収入',
  'income.otherIncome': 'その他収入',
  'expense.housing': '住居費（月額）',
  'expense.food': '食費（月額）',
  'expense.utilities': '光熱費（月額）',
  'expense.communication': '通信費（月額）',
  'expense.insurance': '保険料（月額）',
  'expense.car': '車関連（月額）',
  'expense.dailyGoods': '日用品（月額）',
  'expense.entertainment': '娯楽費（月額）',
  'expense.travel': '旅行費（年額）',
  'expense.otherFixed': 'その他固定費（月額）',
  'expense.otherVariable': 'その他変動費（月額）',
  'investment.monthlyInvestment': '月間投資額',
  'investment.expectedReturn': '期待利回り（%）',
  'investment.nisaMonthly': 'NISA月額',
  'investment.idecoMonthly': 'iDeCo月額',
  'investment.salaryGrowthRate': '昇給率（%）',
  'investment.inflationRate': 'インフレ率（%）',
  'investment.pensionMonthly': '年金月額',
  'investment.pensionStartAge': '年金開始年齢',
  'debt.mortgageLoan': '住宅ローン残高',
  'debt.carLoan': 'カーローン',
  'debt.studentLoan': '奨学金',
  'debt.otherDebt': 'その他負債',
  'assets.savings': '貯蓄',
  'assets.securities': '有価証券',
  'assets.nisa': 'NISA',
  'assets.ideco': 'iDeCo',
  'assets.cash': '現金',
  'assets.other': 'その他資産',
};
