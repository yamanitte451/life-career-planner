from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.schemas import HouseholdDB, LifePlanSchema
import uuid

router = APIRouter()


@router.post("/households")
def create_household(plan: LifePlanSchema, db: Session = Depends(get_db)):
    hh_id = str(uuid.uuid4())
    hh = HouseholdDB(id=hh_id, data=plan.model_dump())
    db.add(hh)
    db.commit()
    return {"id": hh_id}


@router.get("/households/{id}")
def get_household(id: str, db: Session = Depends(get_db)):
    hh = db.query(HouseholdDB).filter(HouseholdDB.id == id).first()
    if not hh:
        raise HTTPException(status_code=404, detail="Not found")
    return hh.data
