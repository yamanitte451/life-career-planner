from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models.schemas import Base
from .routers import households, simulation

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Life Career Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(households.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
