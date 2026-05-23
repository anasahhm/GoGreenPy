from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas.impact import ImpactInput, ImpactResponse, ImpactHistory
from app.auth.dependencies import get_current_user
from app.database import get_database
from app.utils.calculations import (
    calculate_carbon_footprint,
    calculate_water_score,
    calculate_energy_score,
    calculate_waste_score,
    get_overall_rating,
    get_carbon_vs_avg,
)
from app.utils.ai_service import (
    generate_ai_tips,
    generate_ai_analysis,
    generate_weather_insight,
    chat_with_ai,
)
# Rule-based fallback tips (always available, no external dependency)
from app.utils.calculations import generate_tips as generate_rule_based_tips

from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("/calculate", response_model=ImpactResponse, status_code=status.HTTP_201_CREATED)
async def calculate_impact(
    impact_data: ImpactInput,
    current_user: dict = Depends(get_current_user),
):
    # ── Core scores (pure Python — never fails) ──────────────────────────────
    carbon_score, breakdown = calculate_carbon_footprint(
        transport_method    = impact_data.transport_method,
        transport_km        = impact_data.transport_km,
        electricity_kwh     = impact_data.electricity_kwh,
        diet_type           = impact_data.diet_type,
        waste_kg            = impact_data.waste_kg,
        renewable_pct       = impact_data.renewable_pct,
        flights_per_year    = impact_data.flights_per_year,
        heating_fuel        = impact_data.heating_fuel,
        heating_hours       = impact_data.heating_hours,
        meat_meals_per_week = impact_data.meat_meals_per_week,
        plant_based_swaps   = impact_data.plant_based_swaps,
        new_clothing_items  = impact_data.new_clothing_items,
        online_orders       = impact_data.online_orders,
        screen_hours        = impact_data.screen_hours,
        recycling_pct       = impact_data.recycling_pct,
    )

    water_score = calculate_water_score(impact_data.water_liters, impact_data.diet_type)
    energy_score = calculate_energy_score(
        impact_data.electricity_kwh,
        impact_data.transport_km,
        screen_hours  = impact_data.screen_hours,
        heating_hours = impact_data.heating_hours,
    )
    waste_score    = calculate_waste_score(impact_data.waste_kg, recycling_pct=impact_data.recycling_pct)
    overall_rating = get_overall_rating(carbon_score)
    carbon_vs_avg  = get_carbon_vs_avg(carbon_score)

    weather_ctx = impact_data.weather_context

    # ── AI tips — fall back to rule-based if AI service fails ────────────────
    tips = None
    try:
        tips = generate_ai_tips(
            transport_method    = impact_data.transport_method,
            transport_km        = impact_data.transport_km,
            electricity_kwh     = impact_data.electricity_kwh,
            water_liters        = impact_data.water_liters,
            diet_type           = impact_data.diet_type,
            waste_kg            = impact_data.waste_kg,
            carbon_score        = carbon_score,
            overall_rating      = overall_rating,
            renewable_pct       = impact_data.renewable_pct,
            flights_per_year    = impact_data.flights_per_year,
            heating_fuel        = impact_data.heating_fuel,
            meat_meals_per_week = impact_data.meat_meals_per_week,
            plant_based_swaps   = impact_data.plant_based_swaps,
            recycling_pct       = impact_data.recycling_pct,
            new_clothing_items  = impact_data.new_clothing_items,
            online_orders       = impact_data.online_orders,
            screen_hours        = impact_data.screen_hours,
            breakdown           = breakdown,
            weather_context     = weather_ctx.dict() if weather_ctx else None,
        )
    except Exception as exc:
        logger.warning("generate_ai_tips failed (%s) — using rule-based fallback", exc)

    if not tips:
        tips = generate_rule_based_tips(
            transport_method    = impact_data.transport_method,
            transport_km        = impact_data.transport_km,
            electricity_kwh     = impact_data.electricity_kwh,
            diet_type           = impact_data.diet_type,
            waste_kg            = impact_data.waste_kg,
            carbon_score        = carbon_score,
            renewable_pct       = impact_data.renewable_pct,
            flights_per_year    = impact_data.flights_per_year,
            heating_fuel        = impact_data.heating_fuel,
            meat_meals_per_week = impact_data.meat_meals_per_week,
            plant_based_swaps   = impact_data.plant_based_swaps,
            recycling_pct       = impact_data.recycling_pct,
            screen_hours        = impact_data.screen_hours,
            weather_context     = weather_ctx.dict() if weather_ctx else None,
            breakdown           = breakdown,
        )

    # ── AI analysis — optional, degrades gracefully ───────────────────────────
    ai_analysis = None
    try:
        ai_analysis = generate_ai_analysis(
            carbon_score     = carbon_score,
            water_score      = water_score,
            energy_score     = energy_score,
            waste_score      = waste_score,
            overall_rating   = overall_rating,
            transport_method = impact_data.transport_method,
            diet_type        = impact_data.diet_type,
            breakdown        = breakdown,
            carbon_vs_avg    = carbon_vs_avg,
        )
    except Exception as exc:
        logger.warning("generate_ai_analysis failed (%s) — skipping AI analysis", exc)

    # ── Weather insight — optional, degrades gracefully ───────────────────────
    weather_insight = ""
    if weather_ctx:
        try:
            weather_insight = generate_weather_insight(
                carbon_score, weather_ctx.dict()
            )
        except Exception as exc:
            logger.warning("generate_weather_insight failed (%s) — skipping weather insight", exc)

    # ── Persist to database ───────────────────────────────────────────────────
    try:
        db = await get_database()
        impact_log = {
            "user_id":           current_user["id"],
            "transport_method":  impact_data.transport_method,
            "transport_km":      impact_data.transport_km,
            "electricity_kwh":   impact_data.electricity_kwh,
            "water_liters":      impact_data.water_liters,
            "diet_type":         impact_data.diet_type,
            "waste_kg":          impact_data.waste_kg,
            "renewable_pct":        impact_data.renewable_pct,
            "flights_per_year":     impact_data.flights_per_year,
            "heating_fuel":         impact_data.heating_fuel,
            "heating_hours":        impact_data.heating_hours,
            "meat_meals_per_week":  impact_data.meat_meals_per_week,
            "plant_based_swaps":    impact_data.plant_based_swaps,
            "new_clothing_items":   impact_data.new_clothing_items,
            "online_orders":        impact_data.online_orders,
            "screen_hours":         impact_data.screen_hours,
            "recycling_pct":        impact_data.recycling_pct,
            "carbon_score":    carbon_score,
            "water_score":     water_score,
            "energy_score":    energy_score,
            "waste_score":     waste_score,
            "overall_rating":  overall_rating,
            "carbon_vs_avg":   carbon_vs_avg,
            "breakdown":       breakdown,
            "tips":            tips,
            "ai_analysis":     ai_analysis,
            "weather_insight": weather_insight,
            "weather_context": weather_ctx.dict() if weather_ctx else None,
            "created_at":      datetime.utcnow(),
        }
        result = await db.impact_logs.insert_one(impact_log)
        record_id = str(result.inserted_id)
    except Exception as exc:
        # DB failure must not prevent returning the calculated result to the user
        logger.error("DB insert failed: %s", exc)
        record_id = "local"

    return ImpactResponse(
        id              = record_id,
        carbon_score    = carbon_score,
        water_score     = water_score,
        energy_score    = energy_score,
        waste_score     = waste_score,
        overall_rating  = overall_rating,
        carbon_vs_avg   = carbon_vs_avg,
        breakdown       = breakdown,
        tips            = tips,
        ai_analysis     = ai_analysis,
        weather_insight = weather_insight,
        created_at      = datetime.utcnow(),
    )


@router.get("/history", response_model=ImpactHistory)
async def get_impact_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()

    total = await db.impact_logs.count_documents({"user_id": current_user["id"]})

    skip   = (page - 1) * page_size
    cursor = (
        db.impact_logs.find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(page_size)
    )
    logs = await cursor.to_list(length=page_size)

    data = [
        ImpactResponse(
            id              = str(log["_id"]),
            carbon_score    = log["carbon_score"],
            water_score     = log["water_score"],
            energy_score    = log["energy_score"],
            waste_score     = log["waste_score"],
            overall_rating  = log["overall_rating"],
            carbon_vs_avg   = log.get("carbon_vs_avg"),
            breakdown       = log.get("breakdown"),
            tips            = log.get("tips", []),
            ai_analysis     = log.get("ai_analysis"),
            weather_insight = log.get("weather_insight"),
            created_at      = log["created_at"],
        )
        for log in logs
    ]

    return ImpactHistory(total=total, page=page, page_size=page_size, data=data)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    db = await get_database()

    latest_log = await db.impact_logs.find_one(
        {"user_id": current_user["id"]},
        sort=[("created_at", -1)],
    )

    context = None
    if latest_log:
        context = {
            "carbon_score":     latest_log.get("carbon_score"),
            "overall_rating":   latest_log.get("overall_rating"),
            "transport_method": latest_log.get("transport_method"),
            "diet_type":        latest_log.get("diet_type"),
            "breakdown":        latest_log.get("breakdown"),
        }

    try:
        response = chat_with_ai(chat_request.message, context)
    except Exception as exc:
        logger.error("chat_with_ai failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI chat is temporarily unavailable. Please try again shortly.",
        )

    return ChatResponse(response=response)