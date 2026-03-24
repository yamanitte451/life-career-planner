import pytest
from app.services.simulation import run_simulation


def create_base_plan():
    return {
        "household": {
            "self": {"age": 30, "name": "テスト"},
            "spouse": {"age": 28, "name": "配偶者"},
        },
        "income": {
            "selfAnnualIncome": 5000000,
            "spouseAnnualIncome": 4000000,
            "selfBonus": 500000,
            "spouseBonus": 400000,
            "sideJobIncome": 0,
            "otherIncome": 0,
        },
        "expense": {
            "housing": 100000,
            "food": 60000,
            "utilities": 15000,
            "communication": 10000,
            "insurance": 20000,
            "car": 0,
            "dailyGoods": 10000,
            "entertainment": 20000,
            "travel": 200000,
            "otherFixed": 10000,
            "otherVariable": 20000,
        },
        "assets": {
            "savings": 3000000,
            "securities": 1000000,
            "nisa": 500000,
            "ideco": 300000,
            "cash": 200000,
            "other": 0,
        },
        "debt": {
            "mortgageLoan": 0,
            "mortgageMonthly": 0,
            "carLoan": 0,
            "studentLoan": 0,
            "otherDebt": 0,
        },
        "investment": {
            "monthlyInvestment": 50000,
            "expectedReturn": 5,
        },
        "lifeEvents": [],
    }


class TestRunSimulation:
    def test_returns_correct_number_of_years(self):
        result = run_simulation(create_base_plan(), years=10)
        assert len(result) == 10

    def test_caps_years_at_100_minus_age(self):
        plan = create_base_plan()
        plan["household"]["self"]["age"] = 90
        result = run_simulation(plan, years=30)
        assert len(result) == 10

    def test_correct_age_progression(self):
        result = run_simulation(create_base_plan(), years=5)
        assert result[0]["age"] == 30
        assert result[4]["age"] == 34
        assert result[0]["spouseAge"] == 28
        assert result[4]["spouseAge"] == 32

    def test_annual_income_calculation(self):
        result = run_simulation(create_base_plan(), years=1)
        assert result[0]["annualIncome"] == 9900000

    def test_investments_increase_with_positive_return(self):
        result = run_simulation(create_base_plan(), years=10)
        for i in range(1, len(result)):
            assert result[i]["investments"] > result[i - 1]["investments"]

    def test_debt_reduces_with_monthly_payments(self):
        plan = create_base_plan()
        plan["debt"]["mortgageLoan"] = 30000000
        plan["debt"]["mortgageMonthly"] = 100000
        result = run_simulation(plan, years=5)
        assert result[0]["totalDebt"] < 30000000
        for i in range(1, len(result)):
            assert result[i]["totalDebt"] <= result[i - 1]["totalDebt"]

    def test_empty_events_when_no_life_events(self):
        result = run_simulation(create_base_plan(), years=3)
        for r in result:
            assert r["events"] == []


class TestLifeEvents:
    def test_one_time_cost_applied_in_correct_year(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "t1",
                "name": "住宅購入",
                "category": "housing",
                "yearOffset": 2,
                "person": "household",
                "oneTimeCost": 5000000,
                "annualCostChange": 0,
                "annualIncomeChange": 0,
                "durationYears": 1,
                "memo": "",
            }
        ]
        with_events = run_simulation(plan, years=5)
        plan_no_events = create_base_plan()
        without_events = run_simulation(plan_no_events, years=5)

        assert with_events[0]["annualExpense"] == without_events[0]["annualExpense"]
        assert with_events[1]["annualExpense"] == without_events[1]["annualExpense"]
        assert with_events[2]["annualExpense"] == without_events[2]["annualExpense"] + 5000000
        assert with_events[3]["annualExpense"] == without_events[3]["annualExpense"]

    def test_ongoing_cost_changes_for_duration(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "t2",
                "name": "保育園",
                "category": "childcare",
                "yearOffset": 1,
                "person": "household",
                "oneTimeCost": 0,
                "annualCostChange": 600000,
                "annualIncomeChange": 0,
                "durationYears": 3,
                "memo": "",
            }
        ]
        with_events = run_simulation(plan, years=6)
        without_events = run_simulation(create_base_plan(), years=6)

        assert with_events[0]["annualExpense"] == without_events[0]["annualExpense"]
        assert with_events[1]["annualExpense"] == without_events[1]["annualExpense"] + 600000
        assert with_events[2]["annualExpense"] == without_events[2]["annualExpense"] + 600000
        assert with_events[3]["annualExpense"] == without_events[3]["annualExpense"] + 600000
        assert with_events[4]["annualExpense"] == without_events[4]["annualExpense"]

    def test_permanent_income_changes_with_duration_zero(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "t3",
                "name": "転職",
                "category": "career",
                "yearOffset": 3,
                "person": "self",
                "oneTimeCost": 0,
                "annualCostChange": 0,
                "annualIncomeChange": 1000000,
                "durationYears": 0,  # permanent
                "memo": "",
            }
        ]
        result = run_simulation(plan, years=6)
        base = run_simulation(create_base_plan(), years=6)

        assert result[0]["annualIncome"] == base[0]["annualIncome"]
        assert result[2]["annualIncome"] == base[2]["annualIncome"]
        # Permanent from year 3 onward
        assert result[3]["annualIncome"] == base[3]["annualIncome"] + 1000000
        assert result[4]["annualIncome"] == base[4]["annualIncome"] + 1000000
        assert result[5]["annualIncome"] == base[5]["annualIncome"] + 1000000

    def test_event_names_recorded_in_correct_year(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "t4",
                "name": "出産",
                "category": "childbirth",
                "yearOffset": 1,
                "person": "household",
                "oneTimeCost": 500000,
                "annualCostChange": 360000,
                "annualIncomeChange": 0,
                "durationYears": 3,
                "memo": "",
            }
        ]
        result = run_simulation(plan, years=5)
        assert result[0]["events"] == []
        assert result[1]["events"] == ["出産"]
        assert result[2]["events"] == []

    def test_event_at_year_offset_zero(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "y0",
                "name": "即時イベント",
                "category": "other",
                "yearOffset": 0,
                "person": "household",
                "oneTimeCost": 1000000,
                "annualCostChange": 0,
                "annualIncomeChange": 0,
                "durationYears": 1,
                "memo": "",
            }
        ]
        result = run_simulation(plan, years=3)
        base = run_simulation(create_base_plan(), years=3)
        assert result[0]["annualExpense"] == base[0]["annualExpense"] + 1000000
        assert result[0]["events"] == ["即時イベント"]
        assert result[1]["annualExpense"] == base[1]["annualExpense"]

    def test_negative_income_change_retirement(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "ret",
                "name": "退職",
                "category": "retirement",
                "yearOffset": 2,
                "person": "self",
                "oneTimeCost": 0,
                "annualCostChange": 0,
                "annualIncomeChange": -3000000,
                "durationYears": 0,  # permanent
                "memo": "",
            }
        ]
        result = run_simulation(plan, years=5)
        base = run_simulation(create_base_plan(), years=5)
        assert result[2]["annualIncome"] == base[2]["annualIncome"] - 3000000
        assert result[4]["annualIncome"] == base[4]["annualIncome"] - 3000000

    def test_multiple_events_same_year(self):
        plan = create_base_plan()
        plan["lifeEvents"] = [
            {
                "id": "a",
                "name": "転職",
                "category": "career",
                "yearOffset": 2,
                "person": "self",
                "oneTimeCost": 0,
                "annualCostChange": 0,
                "annualIncomeChange": 500000,
                "durationYears": 0,
                "memo": "",
            },
            {
                "id": "b",
                "name": "出産",
                "category": "childbirth",
                "yearOffset": 2,
                "person": "household",
                "oneTimeCost": 500000,
                "annualCostChange": 300000,
                "annualIncomeChange": 0,
                "durationYears": 3,
                "memo": "",
            },
        ]
        result = run_simulation(plan, years=5)
        assert "転職" in result[2]["events"]
        assert "出産" in result[2]["events"]
        assert len(result[2]["events"]) == 2
