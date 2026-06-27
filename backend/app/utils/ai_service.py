import os
import json
from typing import List, Dict, Optional
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def _get_client():
    if not GEMINI_API_KEY:
        return None
    return genai.Client(api_key=GEMINI_API_KEY)


def get_ai_enabled() -> bool:
    return bool(GEMINI_API_KEY)



def _gemini(
    prompt: str,
    system: str = "",
    max_tokens: int = 800,
):
    client = _get_client()

    if not client:
        return None

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{system}\n\n{prompt}",
        )

        return response.text.strip()

    except Exception as e:
        print(f"[ai_service] Gemini API error: {e}")
        return None



def generate_ai_tips(
    transport_method: str,
    transport_km: float,
    electricity_kwh: float,
    water_liters: float,
    diet_type: str,
    waste_kg: float,
    carbon_score: float,
    overall_rating: str,
    # Extended fields
    renewable_pct: float = 0,
    flights_per_year: float = 0,
    heating_fuel: str = "none",
    meat_meals_per_week: float = 7,
    plant_based_swaps: int = 0,
    recycling_pct: float = 50,
    new_clothing_items: float = 0,
    online_orders: float = 0,
    screen_hours: float = 4,
    # Carbon breakdown
    breakdown: dict = None,
    # Live weather context
    weather_context: dict = None,
) -> List[dict]:
    """
    Generate 5–6 personalized, weather-aware tips.
    Returns list of { text, tag } dicts.
    Falls back to rule-based tips if Claude is unavailable.
    """
    if not get_ai_enabled():
        from app.utils.calculations import generate_tips
        return generate_tips(
            transport_method, transport_km, electricity_kwh,
            diet_type, waste_kg, carbon_score,
            renewable_pct=renewable_pct,
            flights_per_year=flights_per_year,
            heating_fuel=heating_fuel,
            meat_meals_per_week=meat_meals_per_week,
            plant_based_swaps=plant_based_swaps,
            recycling_pct=recycling_pct,
            screen_hours=screen_hours,
            weather_context=weather_context,
            breakdown=breakdown,
        )

    # Build weather section for prompt
    weather_str = ""
    if weather_context:
        weather_str = f"""
Current local weather:
- Temperature: {weather_context.get('temp', 'N/A')}°C (feels like {weather_context.get('feels_like', 'N/A')}°C)
- Condition: {weather_context.get('condition', 'N/A')}
- Humidity: {weather_context.get('humidity', 'N/A')}%
- AQI (1=Good → 5=Very Poor): {weather_context.get('aqi', 'N/A')}
- UV Index: {weather_context.get('uv_index', 'N/A')}
- City: {weather_context.get('city', 'N/A')}

Use this weather data to add at least 1-2 weather-relevant tips (e.g. if AQI is poor, advise indoor activities; if it's very hot, advise AC scheduling; if it's raining, suggest rainwater harvesting).
"""

    breakdown_str = ""
    if breakdown:
        breakdown_str = f"\nCarbon breakdown: {json.dumps(breakdown)}"

    prompt = f"""You are GoGreenPy's sustainability expert generating personalized eco-tips for a user in India.

User's daily profile:
- Transport: {transport_method}, {transport_km} km
- Electricity: {electricity_kwh} kWh ({renewable_pct}% renewable)
- Screen time: {screen_hours} hrs/day
- Heating fuel: {heating_fuel} ({heating_fuel} for {0} hrs)
- Water: {water_liters} litres
- Diet: {diet_type}, {meat_meals_per_week} meat meals/week, {plant_based_swaps} plant-based swaps today
- Waste: {waste_kg} kg ({recycling_pct}% recycled)
- Flights/year: {flights_per_year}
- New clothing items this week: {new_clothing_items}
- Online deliveries this week: {online_orders}
- Total carbon footprint: {carbon_score} kg CO₂ (rating: {overall_rating})
{breakdown_str}
{weather_str}

Generate exactly 6 personalized, actionable tips. Rules:
1. Each tip must be SPECIFIC to the user's actual numbers (use the data above)
2. Include at least 1 weather-related tip if weather data is provided
3. Prioritise the user's biggest carbon sources
4. Be encouraging but honest
5. Each tip must have a "tag" from: transport, energy, diet, waste, weather
6. Cite numbers (e.g. "saves 1.2 kg CO₂", "cuts emissions by 30%") where possible

Respond ONLY with a valid JSON array, no markdown, no preamble:
[
  {{"tag": "transport", "text": "..."}},
  {{"tag": "energy", "text": "..."}},
  ...
]"""

    result = _gemini(prompt, max_tokens=900)
    if result:
        try:
            # Strip any accidental markdown fences
            clean = result.replace("```json", "").replace("```", "").strip()
            tips = json.loads(clean)
            if isinstance(tips, list) and len(tips) > 0:
                return tips[:6]
        except (json.JSONDecodeError, KeyError):
            print("[ai_service] Could not parse tips JSON, falling back")

    # Fallback
    from app.utils.calculations import generate_tips
    return generate_tips(
        transport_method, transport_km, electricity_kwh,
        diet_type, waste_kg, carbon_score,
        renewable_pct=renewable_pct,
        flights_per_year=flights_per_year,
        heating_fuel=heating_fuel,
        meat_meals_per_week=meat_meals_per_week,
        plant_based_swaps=plant_based_swaps,
        recycling_pct=recycling_pct,
        screen_hours=screen_hours,
        weather_context=weather_context,
        breakdown=breakdown,
    )


def generate_ai_analysis(
    carbon_score: float,
    water_score: float,
    energy_score: float,
    waste_score: float,
    overall_rating: str,
    transport_method: str,
    diet_type: str,
    breakdown: dict = None,
    carbon_vs_avg: float = 0,
) -> str:
    """3–4 sentence data-driven analysis paragraph."""
    if not get_ai_enabled():
        direction = "above" if carbon_vs_avg > 0 else "below"
        return (
            f"Your daily carbon footprint is {carbon_score} kg CO₂ — "
            f"{abs(carbon_vs_avg):.1f} kg {direction} India's average. "
            f"Overall rating: {overall_rating}. Focus on your highest-impact areas."
        )

    bd_str = f"\nCarbon breakdown: {json.dumps(breakdown)}" if breakdown else ""
    direction = "above" if carbon_vs_avg >= 0 else "below"
    prompt = f"""Provide a concise (3-4 sentence) environmental impact analysis for a user in India.

Data:
- Carbon footprint: {carbon_score} kg CO₂/day ({abs(carbon_vs_avg):.1f} kg {direction} the Indian average of 5 kg CO₂/day)
- Water footprint: {water_score} litres/day
- Energy consumption: {energy_score} kWh/day
- Net waste: {waste_score} kg/day
- Overall rating: {overall_rating}
- Primary transport: {transport_method}
- Diet: {diet_type}
{bd_str}

Your analysis should:
1. Compare to the Indian average (5 kg CO₂/day)
2. Name the biggest contributor
3. Highlight one thing they are doing well
4. End with the single most impactful change they could make

Write in a friendly, direct tone. No bullet points. Plain text only."""

    result = _gemini(prompt, max_tokens=300)
    return result or (
        f"Your carbon footprint is {carbon_score} kg CO₂/day — "
        f"{'above' if carbon_vs_avg > 0 else 'below'} average. Rating: {overall_rating}."
    )


def generate_weather_insight(
    carbon_score: float,
    weather_context: dict,
) -> str:
    """Short 1–2 sentence weather-specific environmental observation."""
    if not get_ai_enabled() or not weather_context:
        return ""

    temp = weather_context.get("temp", 25)
    aqi  = weather_context.get("aqi", 1)
    uv   = weather_context.get("uv_index", 3)
    cond = weather_context.get("condition", "")
    city = weather_context.get("city", "your city")

    prompt = f"""Write 1-2 sentences connecting today's local weather in {city} to environmental action.

Weather: {temp}°C, {cond}, AQI={aqi} (1=Good→5=Very Poor), UV={uv}
User's carbon score today: {carbon_score} kg CO₂

Keep it specific, practical, and under 50 words. Plain text only."""

    result = _gemini(prompt, max_tokens=120)
    return result or ""


def chat_with_ai(message: str, context: Dict = None) -> str:
    """EcoBot — environmental Q&A chatbot."""
    if not get_ai_enabled():
        return "AI chatbot is not available. Set GEMINI_API_KEY in your backend .env file."

    context_str = ""
    if context:
        context_str = f"\n\nUser's recent environmental profile:\n{json.dumps(context, indent=2)}"

    system = (
        "You are EcoBot, GoGreenPy's friendly environmental sustainability assistant. "
        "You help users reduce their carbon footprint with practical, India-specific advice. "
        "Answer in 2-3 sentences max. Be encouraging and specific. "
        "If you don't know something, say so honestly."
    )

    prompt = f"User question: {message}{context_str}"
    result = _gemini(prompt, system=system, max_tokens=200)
    return result or "I'm having trouble right now. Please try again in a moment."



def generate_comparison_insight(user_carbon: float, avg_carbon: float = 5.0) -> str:
    """Quick comparison sentence (no AI needed)."""
    diff = user_carbon - avg_carbon
    if diff > 0:
        return f"Your carbon footprint is {abs(diff):.1f} kg CO₂ higher than India's daily average."
    elif diff < 0:
        return f"Great! Your carbon footprint is {abs(diff):.1f} kg CO₂ lower than India's daily average."
    else:
        return "Your carbon footprint matches India's daily average — there's room to improve!"