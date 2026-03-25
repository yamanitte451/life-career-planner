from sqlalchemy import Column, String, JSON
from sqlalchemy.orm import DeclarativeBase
from pydantic import BaseModel, Field

from enum import Enum
import uuid


class Base(DeclarativeBase):
    pass


class HouseholdDB(Base):
    __tablename__ = "households"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    data = Column(JSON, nullable=False)


# Pydantic schemas
class PersonSchema(BaseModel):
    age: int = 30
    name: str = ""
    employmentType: str = "正社員"
    jobTitle: str = ""
    workplace: str = ""
    commuteMinutes: int = 30
    workStyle: str = "出社"


class HouseholdSchema(BaseModel):
    self_: PersonSchema = Field(alias="self", default_factory=PersonSchema)
    spouse: PersonSchema = Field(default_factory=PersonSchema)
    residenceArea: str = "東京都"
    familyComposition: str = "夫婦のみ"
    hasChildren: bool = False

    model_config = {"populate_by_name": True}


class IncomeSchema(BaseModel):
    selfAnnualIncome: float = 0
    spouseAnnualIncome: float = 0
    selfBonus: float = 0
    spouseBonus: float = 0
    sideJobIncome: float = 0
    otherIncome: float = 0


class ExpenseSchema(BaseModel):
    housing: float = 0
    food: float = 0
    utilities: float = 0
    communication: float = 0
    insurance: float = 0
    car: float = 0
    dailyGoods: float = 0
    entertainment: float = 0
    travel: float = 0
    otherFixed: float = 0
    otherVariable: float = 0


class AssetSchema(BaseModel):
    savings: float = 0
    securities: float = 0
    nisa: float = 0
    ideco: float = 0
    cash: float = 0
    other: float = 0


class DebtSchema(BaseModel):
    mortgageLoan: float = 0
    mortgageMonthly: float = 0
    carLoan: float = 0
    studentLoan: float = 0
    otherDebt: float = 0


class InvestmentSchema(BaseModel):
    monthlyInvestment: float = 0
    expectedReturn: float = 5
    nisaMonthly: float = 0
    idecoMonthly: float = 0
    salaryGrowthRate: float = 0
    inflationRate: float = 0
    pensionMonthly: float = 0
    pensionStartAge: int = 65


class LifeEventCategoryEnum(str, Enum):
    marriage = "marriage"
    childbirth = "childbirth"
    childcare = "childcare"
    education = "education"
    housing = "housing"
    car = "car"
    career = "career"
    retirement = "retirement"
    other = "other"


class PersonTargetEnum(str, Enum):
    self_ = "self"
    spouse = "spouse"
    household = "household"


class LifeEventSchema(BaseModel):
    model_config = {"use_enum_values": True}

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    category: LifeEventCategoryEnum = LifeEventCategoryEnum.other
    yearOffset: int = Field(default=1, ge=0)
    person: PersonTargetEnum = PersonTargetEnum.household
    oneTimeCost: float = Field(default=0, ge=0)
    annualCostChange: float = 0
    annualIncomeChange: float = 0
    durationYears: int = Field(default=0, ge=0)
    memo: str = ""


class LifePlanSchema(BaseModel):
    household: HouseholdSchema = Field(default_factory=HouseholdSchema)
    income: IncomeSchema = Field(default_factory=IncomeSchema)
    expense: ExpenseSchema = Field(default_factory=ExpenseSchema)
    assets: AssetSchema = Field(default_factory=AssetSchema)
    debt: DebtSchema = Field(default_factory=DebtSchema)
    investment: InvestmentSchema = Field(default_factory=InvestmentSchema)
    lifeEvents: list[LifeEventSchema] = Field(default_factory=list)


class SimulationRequest(BaseModel):
    plan: LifePlanSchema
    years: int = 30
