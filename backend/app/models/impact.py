from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ImpactLogModel(BaseModel):
    user_id: str
    transport_method: str
    transport_km: float
    electricity_kwh: float
    water_liters: float
    diet_type: str
    waste_kg: float
    carbon_score: float
    water_score: float
    energy_score: float
    waste_score: float
    overall_rating: str
    tips: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)