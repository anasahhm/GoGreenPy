from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ─── Input ────────────────────────────────────────────────────────────────────

class WeatherContext(BaseModel):
    """Optionally passed by the frontend from the OpenWeatherMap API."""
    temp:       Optional[float] = None
    feels_like: Optional[float] = None
    humidity:   Optional[int]   = None
    condition:  Optional[str]   = None
    aqi:        Optional[int]   = None      # 1 (Good) – 5 (Very Poor)
    uv_index:   Optional[float] = None
    city:       Optional[str]   = None


class ImpactInput(BaseModel):
    # ── Core ──
    transport_method: str   = Field(..., description="car | ev | bus | metro | bike | walk | motorcycle")
    transport_km:     float = Field(..., ge=0, description="Kilometres travelled today")
    electricity_kwh:  float = Field(..., ge=0, description="Electricity usage in kWh")
    water_liters:     float = Field(..., ge=0, description="Direct water usage in litres")
    diet_type:        str   = Field(..., description="vegan | veg | mixed | heavy_meat")
    waste_kg:         float = Field(..., ge=0, description="Waste generated in kg")

    # ── Extended ──
    renewable_pct:        float = Field(default=0,   ge=0,  le=100)
    flights_per_year:     float = Field(default=0,   ge=0)
    heating_fuel:         str   = Field(default="none", description="none | natural_gas | lpg | wood")
    heating_hours:        float = Field(default=0,   ge=0,  le=24)
    meat_meals_per_week:  float = Field(default=7,   ge=0,  le=21)
    plant_based_swaps:    int   = Field(default=0,   ge=0,  le=3)
    new_clothing_items:   float = Field(default=0,   ge=0)
    online_orders:        float = Field(default=0,   ge=0)
    screen_hours:         float = Field(default=4,   ge=0,  le=24)
    recycling_pct:        float = Field(default=50,  ge=0,  le=100)

    # ── Weather context (optional, from frontend) ──
    weather_context: Optional[WeatherContext] = Field(default=None)


# ─── Output ───────────────────────────────────────────────────────────────────

class TipItem(BaseModel):
    """Structured tip with category tag."""
    text: str
    tag:  str   # transport | energy | diet | waste | weather


class ImpactResponse(BaseModel):
    # id is optional — if DB is unavailable we return "local" or skip it
    id:             Optional[str]  = Field(default=None)
    carbon_score:   float
    water_score:    float
    energy_score:   float
    waste_score:    float
    overall_rating: str
    carbon_vs_avg:  Optional[float]            = None
    breakdown:      Optional[Dict[str, float]] = None
    tips:           List[Any]                  = Field(default_factory=list)
    ai_analysis:    Optional[str]              = None
    weather_insight: Optional[str]             = None
    reward_summary: Optional[Any]              = None
    created_at:     datetime


class ImpactHistory(BaseModel):
    total:     int
    page:      int
    page_size: int
    data:      List[ImpactResponse]


# ─── DB model ─────────────────────────────────────────────────────────────────

class ImpactLogModel(BaseModel):
    user_id:          str
    transport_method: str
    transport_km:     float
    electricity_kwh:  float
    water_liters:     float
    diet_type:        str
    waste_kg:         float
    # Extended
    renewable_pct:       float = 0
    flights_per_year:    float = 0
    heating_fuel:        str   = "none"
    heating_hours:       float = 0
    meat_meals_per_week: float = 7
    plant_based_swaps:   int   = 0
    new_clothing_items:  float = 0
    online_orders:       float = 0
    screen_hours:        float = 4
    recycling_pct:       float = 50
    # Scores
    carbon_score:   float
    water_score:    float
    energy_score:   float
    waste_score:    float
    overall_rating: str
    carbon_vs_avg:  float = 0
    breakdown:      Optional[Dict[str, float]] = None
    # AI outputs
    tips:            List[Any]         = Field(default_factory=list)
    ai_analysis:     Optional[str]     = None
    weather_insight: Optional[str]     = None
    weather_context: Optional[Dict[str, Any]] = None
    created_at:      datetime          = Field(default_factory=datetime.utcnow)