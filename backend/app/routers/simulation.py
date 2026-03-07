from fastapi import APIRouter
from ..models.schemas import SimulationRequest
from ..services.simulation import run_simulation

router = APIRouter()


@router.post("/simulation")
def simulate(req: SimulationRequest):
    result = run_simulation(req.plan.model_dump(), req.years)
    return {"data": result}
