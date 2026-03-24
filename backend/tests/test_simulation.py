from datetime import datetime

from app.services.simulation import run_simulation


def _base_plan():
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
            "nisaMonthly": 30000,
            "idecoMonthly": 23000,
        },
        "lifeEvents": [],
    }


class TestRunSimulation:
    def test_returns_correct_number_of_years(self):
        result = run_simulation(_base_plan(), years=10)
        assert len(result) == 10

    def test_limits_years_to_100_minus_age(self):
        plan = _base_plan()
        plan["household"]["self"]["age"] = 95
        result = run_simulation(plan, years=30)
        assert len(result) == 5

    def test_returns_empty_for_age_100(self):
        plan = _base_plan()
        plan["household"]["self"]["age"] = 100
        result = run_simulation(plan, years=10)
        assert len(result) == 0

    def test_first_year_is_current_year(self):
        result = run_simulation(_base_plan(), years=5)
        assert result[0]["year"] == datetime.now().year

    def test_ages_increment(self):
        plan = _base_plan()
        result = run_simulation(plan, years=5)
        for i, row in enumerate(result):
            assert row["age"] == 30 + i
            assert row["spouseAge"] == 28 + i

    def test_annual_income_calculated_correctly(self):
        plan = _base_plan()
        result = run_simulation(plan, years=1)
        expected = (
            plan["income"]["selfAnnualIncome"]
            + plan["income"]["spouseAnnualIncome"]
            + plan["income"]["selfBonus"]
            + plan["income"]["spouseBonus"]
            + plan["income"]["sideJobIncome"]
            + plan["income"]["otherIncome"]
        )
        assert result[0]["annualIncome"] == expected

    def test_investment_compound_growth(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["assets"]["securities"] = 1000000
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 10

        result = run_simulation(plan, years=2)
        assert abs(result[0]["investments"] - 1100000) < 1
        assert abs(result[1]["investments"] - 1210000) < 1

    def test_debt_decreases(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["debt"]["mortgageLoan"] = 10000000
        plan["debt"]["mortgageMonthly"] = 100000
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0

        result = run_simulation(plan, years=3)
        assert result[0]["totalDebt"] == 10000000 - 1200000
        assert result[1]["totalDebt"] == 10000000 - 2400000

    def test_debt_does_not_go_below_zero(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["debt"]["mortgageLoan"] = 500000
        plan["debt"]["mortgageMonthly"] = 100000
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0

        result = run_simulation(plan, years=3)
        assert result[0]["totalDebt"] == 0
        assert result[1]["totalDebt"] == 0

    def test_net_assets_equals_total_minus_debt(self):
        result = run_simulation(_base_plan(), years=5)
        for row in result:
            assert abs(row["netAssets"] - (row["totalAssets"] - row["totalDebt"])) < 1

    def test_zero_income_and_expense(self):
        plan = _base_plan()
        plan["income"] = {k: 0 for k in plan["income"]}
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["assets"]["savings"] = 1000000

        result = run_simulation(plan, years=5)
        assert len(result) == 5
        for row in result:
            assert row["totalAssets"] == 1000000
            assert row["annualSavings"] == 0

    def test_empty_events_when_no_life_events(self):
        result = run_simulation(_base_plan(), years=3)
        for r in result:
            assert r["events"] == []


class TestLifeEvents:
    def test_one_time_cost_applied_in_correct_year(self):
        plan = _base_plan()
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
        plan_no_events = _base_plan()
        without_events = run_simulation(plan_no_events, years=5)

        assert with_events[0]["annualExpense"] == without_events[0]["annualExpense"]
        assert with_events[1]["annualExpense"] == without_events[1]["annualExpense"]
        assert with_events[2]["annualExpense"] == without_events[2]["annualExpense"] + 5000000
        assert with_events[3]["annualExpense"] == without_events[3]["annualExpense"]

    def test_ongoing_cost_changes_for_duration(self):
        plan = _base_plan()
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
        without_events = run_simulation(_base_plan(), years=6)

        assert with_events[0]["annualExpense"] == without_events[0]["annualExpense"]
        assert with_events[1]["annualExpense"] == without_events[1]["annualExpense"] + 600000
        assert with_events[2]["annualExpense"] == without_events[2]["annualExpense"] + 600000
        assert with_events[3]["annualExpense"] == without_events[3]["annualExpense"] + 600000
        assert with_events[4]["annualExpense"] == without_events[4]["annualExpense"]

    def test_permanent_income_changes_with_duration_zero(self):
        plan = _base_plan()
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
        base = run_simulation(_base_plan(), years=6)

        assert result[0]["annualIncome"] == base[0]["annualIncome"]
        assert result[2]["annualIncome"] == base[2]["annualIncome"]
        # Permanent from year 3 onward
        assert result[3]["annualIncome"] == base[3]["annualIncome"] + 1000000
        assert result[4]["annualIncome"] == base[4]["annualIncome"] + 1000000
        assert result[5]["annualIncome"] == base[5]["annualIncome"] + 1000000

    def test_event_names_recorded_in_correct_year(self):
        plan = _base_plan()
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
        plan = _base_plan()
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
        base = run_simulation(_base_plan(), years=3)
        assert result[0]["annualExpense"] == base[0]["annualExpense"] + 1000000
        assert result[0]["events"] == ["即時イベント"]
        assert result[1]["annualExpense"] == base[1]["annualExpense"]

    def test_negative_income_change_retirement(self):
        plan = _base_plan()
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
        base = run_simulation(_base_plan(), years=5)
        assert result[2]["annualIncome"] == base[2]["annualIncome"] - 3000000
        assert result[4]["annualIncome"] == base[4]["annualIncome"] - 3000000

    def test_multiple_events_same_year(self):
        plan = _base_plan()
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

    def test_self_underscore_alias_handled(self):
        """Regression: Pydantic model_dump() produces 'self_' key; simulation must handle both."""
        plan = _base_plan()
        # Replace "self" key with "self_" (as Pydantic would produce)
        self_data = plan["household"].pop("self")
        plan["household"]["self_"] = self_data
        result = run_simulation(plan, years=3)
        assert len(result) == 3
        assert result[0]["age"] == 30
