import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app, get_db, Base


@pytest.fixture()
def client():
    # Create an in-memory SQLite database for tests
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create all tables on the test database
    Base.metadata.create_all(bind=engine)

    # Override the application's get_db dependency to use the test session
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
class TestHealthEndpoint:
    def test_health(self, client: TestClient):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestHouseholdsEndpoint:
    def _plan_payload(self):
        return {
            "household": {
                "self": {"age": 30},
                "spouse": {"age": 28},
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
        }

    def test_create_household(self, client: TestClient):
        resp = client.post("/api/households", json=self._plan_payload())
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert isinstance(data["id"], str)

    def test_get_household(self, client: TestClient):
        create_resp = client.post("/api/households", json=self._plan_payload())
        hh_id = create_resp.json()["id"]

        resp = client.get(f"/api/households/{hh_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["income"]["selfAnnualIncome"] == 5000000

    def test_get_household_not_found(self, client: TestClient):
        resp = client.get("/api/households/nonexistent-id")
        assert resp.status_code == 404


class TestSimulationEndpoint:
    def test_simulation(self, client: TestClient):
        payload = {
            "plan": {
                "household": {
                    "self": {"age": 30},
                    "spouse": {"age": 28},
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
            },
            "years": 10,
        }
        resp = client.post("/api/simulation", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert len(data["data"]) == 10
        assert data["data"][0]["age"] == 30

    def test_simulation_custom_years(self, client: TestClient):
        payload = {
            "plan": {
                "household": {
                    "self": {"age": 30},
                    "spouse": {"age": 28},
                },
                "income": {},
                "expense": {},
                "assets": {},
                "debt": {},
                "investment": {},
            },
            "years": 5,
        }
        resp = client.post("/api/simulation", json=payload)
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 5
