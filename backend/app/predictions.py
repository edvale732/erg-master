from fastapi import APIRouter
from datetime import date
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/predictions",
    tags=["predictions"]
)


class SessionInterval(BaseModel):
    distance: int
    timeSeconds: int
    avgStrokeRate: Optional[int] = None
    avgWatts: Optional[int] = None
    restTimeSeconds: Optional[int] = None


class Session(BaseModel):
    sessionDate: date
    sessionType: str
    intervals: List[SessionInterval]


class PredictionRequest(BaseModel):
    sessions: List[Session]


@router.post("/")
async def get_predictions(request: PredictionRequest):
    
    return {
        "prediction": "prediction result",
        "sessionsUsed": len(request.sessions),
    }