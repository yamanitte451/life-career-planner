import { LifePlan, SimulationYearData } from './types';
import { formatMan } from './simulation';

export function buildSystemPrompt(
  plan: LifePlan,
  simulation: SimulationYearData[]
): string {
  const first = simulation[0];
  const year10 = simulation[9];
  const year30 = simulation[29];

  const totalAnnualIncome =
    plan.income.selfAnnualIncome + plan.income.spouseAnnualIncome +
    plan.income.selfBonus + plan.income.spouseBonus +
    plan.income.sideJobIncome + plan.income.otherIncome;

  const monthlyExpense =
    plan.expense.housing + plan.expense.food + plan.expense.utilities +
    plan.expense.communication + plan.expense.insurance + plan.expense.car +
    plan.expense.dailyGoods + plan.expense.entertainment +
    plan.expense.otherFixed + plan.expense.otherVariable;

  const totalAssets =
    plan.assets.savings + plan.assets.securities + plan.assets.nisa +
    plan.assets.ideco + plan.assets.cash + plan.assets.other;

  const totalDebt =
    plan.debt.mortgageLoan + plan.debt.carLoan +
    plan.debt.studentLoan + plan.debt.otherDebt;

  const events = plan.lifeEvents.map(
    (e) => `- ${e.yearOffset}年後: ${e.name}（一時費用 ${formatMan(e.oneTimeCost)}、年間支出変動 ${formatMan(e.annualCostChange)}）`
  ).join('\n');

  const childrenInfo = plan.household.children.length > 0
    ? plan.household.children.map((c) => {
        const age = -c.birthYearOffset;
        return `- ${c.name || '子ども'}（${age >= 0 ? `現在${age}歳` : `${-age}年後に誕生予定`}）`;
      }).join('\n')
    : 'なし';

  return `あなたは日本のファイナンシャルプランナー兼キャリアアドバイザーです。
以下のユーザーの世帯情報とシミュレーション結果をもとに、ライフプランやキャリアについて具体的で実践的なアドバイスを提供してください。

## ユーザー世帯情報

### 基本情報
- 本人: ${plan.household.self.age}歳、${plan.household.self.employmentType}${plan.household.self.jobTitle ? `（${plan.household.self.jobTitle}）` : ''}
- 配偶者: ${plan.household.spouse.age}歳、${plan.household.spouse.employmentType}${plan.household.spouse.jobTitle ? `（${plan.household.spouse.jobTitle}）` : ''}
- 居住地: ${plan.household.residenceArea}
- 家族構成: ${plan.household.familyComposition}
- 子ども: ${childrenInfo}

### 収支状況
- 世帯年収: ${formatMan(totalAnnualIncome)}
  - 本人年収: ${formatMan(plan.income.selfAnnualIncome)}（賞与 ${formatMan(plan.income.selfBonus)}）
  - 配偶者年収: ${formatMan(plan.income.spouseAnnualIncome)}（賞与 ${formatMan(plan.income.spouseBonus)}）
  ${plan.income.sideJobIncome > 0 ? `- 副業収入: ${formatMan(plan.income.sideJobIncome)}` : ''}
- 月額支出: ${formatMan(monthlyExpense)}（うち住居費 ${formatMan(plan.expense.housing)}）

### 資産・負債
- 総資産: ${formatMan(totalAssets)}
- 総負債: ${formatMan(totalDebt)}
- 純資産: ${formatMan(totalAssets - totalDebt)}

### 投資方針
- 月間投資額: ${formatMan(plan.investment.monthlyInvestment)}
- 想定利回り: ${plan.investment.expectedReturn}%
${plan.investment.nisaMonthly > 0 ? `- NISA: 月${formatMan(plan.investment.nisaMonthly)}` : ''}
${plan.investment.idecoMonthly > 0 ? `- iDeCo: 月${formatMan(plan.investment.idecoMonthly)}` : ''}

### ライフイベント
${events || '登録なし'}

## シミュレーション結果サマリー
- 現在（${first?.age}歳）: 純資産 ${first ? formatMan(first.netAssets) : '—'}
${year10 ? `- 10年後（${year10.age}歳）: 純資産 ${formatMan(year10.netAssets)}、年収 ${formatMan(year10.annualIncome)}` : ''}
${year30 ? `- 30年後（${year30.age}歳）: 純資産 ${formatMan(year30.netAssets)}、年収 ${formatMan(year30.annualIncome)}` : ''}

## 回答の指針
- 日本の制度・税制に基づいた具体的なアドバイスを提供してください
- ユーザーの数値データを踏まえ、一般論ではなく個別の状況に即した回答をしてください
- 必要に応じて追加の質問をして、より深い相談に対応してください
- 具体的な数値や試算を交えて説明してください
- 「参考値」であることを適宜明示してください`;
}
