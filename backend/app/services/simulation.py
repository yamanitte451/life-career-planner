from typing import List, Dict, Any


def run_simulation(plan: Dict[str, Any], years: int = 30) -> List[Dict]:
    from datetime import datetime
    current_year = datetime.now().year

    income = plan.get("income", {})
    expense = plan.get("expense", {})
    assets = plan.get("assets", {})
    debt = plan.get("debt", {})
    investment = plan.get("investment", {})
    household = plan.get("household", {})

    self_age = household.get("self", {}).get("age", 30)
    spouse_age = household.get("spouse", {}).get("age", 28)

    annual_income = (
        income.get("selfAnnualIncome", 0) + income.get("spouseAnnualIncome", 0) +
        income.get("selfBonus", 0) + income.get("spouseBonus", 0) +
        income.get("sideJobIncome", 0) + income.get("otherIncome", 0)
    )

    monthly_expense = sum([
        expense.get("housing", 0), expense.get("food", 0), expense.get("utilities", 0),
        expense.get("communication", 0), expense.get("insurance", 0), expense.get("car", 0),
        expense.get("dailyGoods", 0), expense.get("entertainment", 0),
        expense.get("otherFixed", 0), expense.get("otherVariable", 0),
    ])
    annual_expense = monthly_expense * 12 + expense.get("travel", 0)

    current_savings = assets.get("savings", 0) + assets.get("cash", 0) + assets.get("other", 0)
    current_investments = assets.get("securities", 0) + assets.get("nisa", 0) + assets.get("ideco", 0)
    current_debt = max(0, sum([
        debt.get("mortgageLoan", 0), debt.get("carLoan", 0),
        debt.get("studentLoan", 0), debt.get("otherDebt", 0)
    ]))

    annual_debt_repayment = debt.get("mortgageMonthly", 0) * 12
    annual_investment = investment.get("monthlyInvestment", 0) * 12
    return_rate = investment.get("expectedReturn", 5) / 100

    max_years = min(years, 100 - self_age)
    results = []

    for y in range(max_years):
        year = current_year + y
        age = self_age + y
        s_age = spouse_age + y

        current_investments = current_investments * (1 + return_rate) + annual_investment
        investment_growth = current_investments * return_rate

        annual_savings = annual_income - annual_expense - annual_investment - annual_debt_repayment
        current_savings = current_savings + annual_savings

        debt_paid = min(current_debt, annual_debt_repayment)
        current_debt = max(0, current_debt - debt_paid)

        total_assets = max(0, current_savings) + current_investments
        net_assets = total_assets - current_debt

        results.append({
            "year": year,
            "age": age,
            "spouseAge": s_age,
            "annualIncome": annual_income,
            "annualExpense": annual_expense + annual_investment + annual_debt_repayment,
            "annualSavings": annual_savings,
            "investmentGrowth": investment_growth,
            "totalAssets": total_assets,
            "totalDebt": current_debt,
            "netAssets": net_assets,
            "savings": max(0, current_savings),
            "investments": current_investments,
        })

    return results
