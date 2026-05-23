from typing import List, Dict, Tuple

# ─── Emission factors (kg CO2 per unit) ───────────────────────────────────────

TRANSPORT_EMISSION = {
    "car":        0.21,    # petrol/diesel car, kg CO2/km (UK avg)
    "ev":         0.047,   # electric vehicle (India grid mix)
    "bus":        0.082,   # average bus, kg CO2/km per passenger
    "metro":      0.041,   # metro/rail, kg CO2/km per passenger
    "bike":       0.0,
    "walk":       0.0,
    "motorcycle": 0.113,   # average motorbike
}

DIET_EMISSIONS = {
    "vegan":      1.5,     # kg CO2/day
    "veg":        2.0,
    "mixed":      3.5,
    "heavy_meat": 7.0,
}

HEATING_FUEL_EMISSION = {
    "none":        0.0,
    "natural_gas": 0.202,  # kg CO2 per kWh thermal
    "lpg":         0.227,  # kg CO2 per kWh thermal
    "wood":        0.030,  # biomass — low net CO2
}

ELECTRICITY_EMISSION     = 0.716   # kg CO2/kWh — India average grid factor
RENEWABLE_SAVINGS_FACTOR = 0.716   # saved per kWh from renewables
WASTE_EMISSION           = 0.458   # kg CO2/kg waste to landfill
FLIGHT_DAILY_FACTOR      = 0.255   # kg CO2 per flight per day (≈93 kg CO2/flight ÷ 365)
SCREEN_EMISSION_PER_HR   = 0.036   # kg CO2/hour (laptop+phone avg)
CLOTHING_EMISSION        = 20.0    # kg CO2 per new garment (fast fashion avg)
DELIVERY_EMISSION        = 0.55    # kg CO2 per online delivery (last-mile van)
MEAT_MEAL_DAILY_FACTOR   = 0.286   # kg CO2 per meat-containing meal per day in week
WATER_CO2_PER_LITER      = 0.0003  # kg CO2 per liter (treatment + pumping)

# ─── Averages for comparison (India daily) ────────────────────────────────────
INDIA_DAILY_CARBON_AVG = 5.0       # kg CO2/day per capita (rough)


# ─── Core calculations ────────────────────────────────────────────────────────

def calculate_carbon_footprint(
    transport_method: str,
    transport_km: float,
    electricity_kwh: float,
    diet_type: str,
    waste_kg: float,
    renewable_pct: float = 0,
    flights_per_year: float = 0,
    heating_fuel: str = "none",
    heating_hours: float = 0,
    meat_meals_per_week: float = 7,
    plant_based_swaps: int = 0,
    new_clothing_items: float = 0,
    online_orders: float = 0,
    screen_hours: float = 4,
    recycling_pct: float = 50,
) -> Tuple[float, Dict[str, float]]:
    """
    Returns (total_carbon_kg_co2, breakdown_dict).
    breakdown keys: transport, electricity, diet, waste, flights, heating
    """
    # Clamp all inputs to safe ranges
    transport_km        = max(0.0, transport_km)
    electricity_kwh     = max(0.0, electricity_kwh)
    waste_kg            = max(0.0, waste_kg)
    renewable_pct       = max(0.0, min(100.0, renewable_pct))
    flights_per_year    = max(0.0, flights_per_year)
    heating_hours       = max(0.0, min(24.0, heating_hours))
    meat_meals_per_week = max(0.0, min(21.0, meat_meals_per_week))
    plant_based_swaps   = max(0, min(3, int(plant_based_swaps)))
    new_clothing_items  = max(0.0, new_clothing_items)
    online_orders       = max(0.0, online_orders)
    screen_hours        = max(0.0, min(24.0, screen_hours))
    recycling_pct       = max(0.0, min(100.0, recycling_pct))

    # Transport
    transport_co2 = TRANSPORT_EMISSION.get(transport_method, 0.21) * transport_km

    # Electricity — subtract savings from renewables, add screen device energy
    renewable_fraction = renewable_pct / 100.0
    net_grid_kwh       = electricity_kwh * (1.0 - renewable_fraction)
    screen_kwh         = screen_hours * 0.05   # avg ~50 W draw
    electricity_co2    = (net_grid_kwh + screen_kwh) * ELECTRICITY_EMISSION

    # Diet — base + meat frequency modifier + plant-based swap saving
    base_diet_co2 = DIET_EMISSIONS.get(diet_type, 3.5)
    typical_meat  = {"vegan": 0, "veg": 0, "mixed": 7, "heavy_meat": 14}
    meat_diff     = (meat_meals_per_week - typical_meat.get(diet_type, 7)) * MEAT_MEAL_DAILY_FACTOR / 7
    swap_saving   = plant_based_swaps * 0.4   # each swap saves ~0.4 kg CO2
    diet_co2      = max(0.5, base_diet_co2 + meat_diff - swap_saving)

    # Waste — recycled portion has much lower emission
    recycled_fraction = recycling_pct / 100.0
    effective_waste   = waste_kg * (1.0 - recycled_fraction * 0.85)
    waste_co2         = effective_waste * WASTE_EMISSION

    # Flights (amortised daily)
    flights_co2 = flights_per_year * FLIGHT_DAILY_FACTOR

    # Heating / cooking fuel (2 kWh thermal per hour as rough proxy)
    heating_thermal_kwh = heating_hours * 2.0
    heating_co2         = heating_thermal_kwh * HEATING_FUEL_EMISSION.get(heating_fuel, 0.0)

    # Consumption (weekly items ÷ 7 to get daily amortised figure)
    consumption_co2 = (
        new_clothing_items * CLOTHING_EMISSION + online_orders * DELIVERY_EMISSION
    ) / 7.0

    total = (
        transport_co2 + electricity_co2 + diet_co2 +
        waste_co2 + flights_co2 + heating_co2 + consumption_co2
    )

    breakdown = {
        "transport":   round(transport_co2, 3),
        "electricity": round(electricity_co2 + consumption_co2, 3),
        "diet":        round(diet_co2, 3),
        "waste":       round(waste_co2, 3),
        "flights":     round(flights_co2, 3),
        "heating":     round(heating_co2, 3),
    }

    return round(total, 2), breakdown


def calculate_water_score(water_liters: float, diet_type: str) -> float:
    """Calculate total water footprint in litres (direct + virtual/food water)."""
    diet_virtual_water = {
        "vegan":      1200,
        "veg":        1500,
        "mixed":      3000,
        "heavy_meat": 5000,
    }
    total_water = max(0.0, water_liters) + diet_virtual_water.get(diet_type, 3000)
    return round(total_water, 2)


def calculate_energy_score(
    electricity_kwh: float,
    transport_km: float,
    screen_hours: float = 4,
    heating_hours: float = 0,
) -> float:
    """Total energy consumed in kWh equivalent."""
    screen_kwh    = max(0.0, screen_hours) * 0.05
    heating_kwh   = max(0.0, heating_hours) * 2.0
    transport_kwh = max(0.0, transport_km) * 0.2   # rough average across modes
    return round(max(0.0, electricity_kwh) + screen_kwh + heating_kwh + transport_kwh, 2)


def calculate_waste_score(waste_kg: float, recycling_pct: float = 50) -> float:
    """Net waste to landfill after recycling."""
    waste_kg      = max(0.0, waste_kg)
    recycled      = waste_kg * max(0.0, min(1.0, recycling_pct / 100.0))
    return round(max(0.0, waste_kg - recycled), 2)


def get_overall_rating(carbon_score: float) -> str:
    """Determine overall environmental rating based on daily CO2."""
    if carbon_score < 3:
        return "Excellent"
    elif carbon_score < 5:
        return "Good"
    elif carbon_score < 8:
        return "Moderate"
    elif carbon_score < 12:
        return "Poor"
    else:
        return "Critical"


def get_carbon_vs_avg(carbon_score: float) -> float:
    """Returns delta vs India daily average (+ve = worse than avg)."""
    return round(carbon_score - INDIA_DAILY_CARBON_AVG, 2)


# ─── Rule-based tips (fallback when AI is unavailable) ───────────────────────

def generate_tips(
    transport_method: str,
    transport_km: float,
    electricity_kwh: float,
    diet_type: str,
    waste_kg: float,
    carbon_score: float,
    renewable_pct: float = 0,
    flights_per_year: float = 0,
    heating_fuel: str = "none",
    meat_meals_per_week: float = 7,
    plant_based_swaps: int = 0,
    recycling_pct: float = 50,
    screen_hours: float = 4,
    weather_context: dict = None,
    breakdown: dict = None,
) -> List[dict]:
    """
    Returns list of tip dicts: { text: str, tag: str }
    Tags: transport | energy | diet | waste | weather
    """
    tips = []

    # Find biggest offender from breakdown
    if breakdown:
        top_category = max(breakdown, key=breakdown.get)
    else:
        top_category = "diet"

    # ── Transport ──
    if transport_method == "car" and transport_km > 15:
        tips.append({
            "tag": "transport",
            "text": f"Your {transport_km:.0f} km car trip emits ~{transport_km * 0.21:.1f} kg CO₂. "
                    "Carpooling with one other person cuts that in half.",
        })
    elif transport_method == "car" and transport_km > 5:
        tips.append({
            "tag": "transport",
            "text": "Consider using the metro or bus for distances under 15 km — it emits 60–75% less CO₂ than a solo car.",
        })
    elif transport_method in ["bike", "walk"]:
        tips.append({
            "tag": "transport",
            "text": "Great choice going car-free today! Consistent active transport saves ~1–3 kg CO₂ daily.",
        })

    # ── Flights ──
    if flights_per_year > 4:
        tips.append({
            "tag": "transport",
            "text": f"{flights_per_year:.0f} flights/year adds ~{flights_per_year * 93:.0f} kg CO₂ annually. "
                    "Replacing one return flight with train travel can save 75–90% of that.",
        })

    # ── Electricity / energy ──
    if electricity_kwh > 10:
        tips.append({
            "tag": "energy",
            "text": f"At {electricity_kwh} kWh today, consider shifting heavy appliances (washing, AC) "
                    "to off-peak solar hours (10am–4pm).",
        })
    if renewable_pct < 20 and electricity_kwh > 5:
        tips.append({
            "tag": "energy",
            "text": "Installing even a small rooftop solar panel (1 kWp) can offset 1.4 kg CO₂ daily "
                    "and typically pays back in 4–6 years in India.",
        })
    if screen_hours > 6:
        tips.append({
            "tag": "energy",
            "text": f"Your {screen_hours:.0f} hours of screen time uses ~{screen_hours * 0.05:.1f} kWh/day. "
                    "Enable dark mode and reduce brightness to cut device energy use by up to 30%.",
        })

    # ── Heating ──
    if heating_fuel in ["lpg", "natural_gas"] and heating_hours > 1:
        tips.append({
            "tag": "energy",
            "text": f"Using LPG/gas for {heating_hours:.1f} hrs/day adds ~{heating_hours * 2 * 0.227:.2f} kg CO₂. "
                    "An induction cooktop on renewable electricity cuts cooking emissions by over 80%.",
        })

    # ── Diet ──
    if diet_type == "heavy_meat":
        tips.append({
            "tag": "diet",
            "text": "A heavy-meat diet generates up to 7 kg CO₂/day from food alone. "
                    "Replacing red meat with chicken or legumes 3× per week can reduce diet emissions by 30–40%.",
        })
    elif diet_type == "mixed" and meat_meals_per_week > 10:
        tips.append({
            "tag": "diet",
            "text": f"You're having {meat_meals_per_week:.0f} meat meals/week. "
                    "Dropping to 7 saves roughly 1.5 kg CO₂/day — equivalent to skipping a 7 km car trip.",
        })
    if plant_based_swaps > 0:
        tips.append({
            "tag": "diet",
            "text": f"Great job swapping {plant_based_swaps} meal(s) to plant-based today! "
                    f"That saved ~{plant_based_swaps * 0.4:.1f} kg CO₂.",
        })

    # ── Waste ──
    if recycling_pct < 40:
        tips.append({
            "tag": "waste",
            "text": f"Only {recycling_pct:.0f}% of your waste is recycled. "
                    "Separating dry recyclables (paper, plastic, metal) can divert 50–70% from landfill.",
        })
    elif waste_kg > 1.5:
        tips.append({
            "tag": "waste",
            "text": "Try composting wet kitchen waste — it prevents methane from landfill and creates free fertiliser. "
                    "A small bucket on the counter is all you need.",
        })

    # ── Weather-aware tips ──
    if weather_context:
        temp = weather_context.get("temp") or 25
        aqi  = weather_context.get("aqi")
        uv   = weather_context.get("uv_index") or 0
        cond = weather_context.get("condition") or ""

        if temp >= 35:
            tips.append({
                "tag": "weather",
                "text": f"It's {temp}°C today. Pre-cool your home before peak hours (2–5 pm) "
                        "to reduce AC runtime by 20–30% without sacrificing comfort.",
            })
        elif temp <= 15:
            tips.append({
                "tag": "weather",
                "text": f"With temperatures at {temp}°C, layer clothing before turning on heating — "
                        "each degree lower on the thermostat saves ~5% energy.",
            })

        if aqi is not None:
            if aqi >= 4:
                tips.append({
                    "tag": "weather",
                    "text": "AQI is Poor today — outdoor air quality is unhealthy. "
                            "Avoid exercising outdoors and consider an air purifier with a HEPA filter indoors.",
                })
            elif aqi == 3:
                tips.append({
                    "tag": "weather",
                    "text": "Moderate air quality today. Walk or cycle in parks and green corridors where vehicle pollution is lower.",
                })

        if uv >= 8:
            tips.append({
                "tag": "weather",
                "text": f"UV index is {uv} (Very High). Use physical sun barriers instead of chemical sunscreen "
                        "where possible — they're better for aquatic ecosystems.",
            })

        if "rain" in cond.lower() or "drizzle" in cond.lower():
            tips.append({
                "tag": "weather",
                "text": "It's raining — a great day to collect rainwater for plants and garden use, "
                        "reducing your treated water consumption.",
            })

    # ── Top category callout ──
    if breakdown and top_category == "flights" and breakdown.get("flights", 0) > 1:
        tips.insert(0, {
            "tag": "transport",
            "text": f"Flights account for your biggest emission today ({breakdown['flights']:.1f} kg CO₂ amortised). "
                    "Bundling trips and choosing direct routes can cut flight emissions by 25%.",
        })

    # ── Positive reinforcement ──
    if carbon_score < 3:
        tips.append({
            "tag": "diet",
            "text": "Your daily footprint is excellent — well below India's average of 5 kg CO₂/day. "
                    "Keep it up and inspire someone around you!",
        })

    # Ensure at least 3 tips
    while len(tips) < 3:
        extras = [
            {"tag": "energy", "text": "Unplugging devices on standby can save 5–10% of household electricity — a small habit with real impact."},
            {"tag": "diet",   "text": "Try a weekly 'no-waste' meal using whatever is in your fridge — it reduces food waste and saves money."},
            {"tag": "transport", "text": "Combining errands into one trip rather than multiple short ones can cut transport emissions by 20–40%."},
        ]
        for e in extras:
            if len(tips) < 3:
                tips.append(e)

    return tips[:6]   # return at most 6 tips