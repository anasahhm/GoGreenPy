"""
app/utils/rewards.py

Point arithmetic, eco-level tiers, and reward processing helper.
Pure functions — no I/O, no Supabase calls.
"""

from typing import Any, Dict, List, Optional

# ── Point deltas ──────────────────────────────────────────────────────────────

RATING_POINTS: Dict[str, int] = {
    "Excellent": 10,
    "Good":      10,
    "Moderate":   4,
    "Poor":      -4,
    "Critical":  -4,
}

# ── Eco levels ────────────────────────────────────────────────────────────────

ECO_LEVELS = [
    {"label": "Planet Guardian",   "min": 100, "rank": 4},
    {"label": "Sustainability Pro","min": 50,  "rank": 3},
    {"label": "Green Explorer",    "min": 20,  "rank": 2},
    {"label": "Eco Starter",       "min": 0,   "rank": 1},
]


def points_for_rating(overall_rating: str) -> int:
    return RATING_POINTS.get(overall_rating, 0)


def get_eco_level(total_points: int) -> Dict[str, Any]:
    for level in ECO_LEVELS:
        if total_points >= level["min"]:
            return level
    return ECO_LEVELS[-1]


def next_level_info(total_points: int) -> Dict[str, Any]:
    current      = get_eco_level(total_points)
    current_rank = current["rank"]
    next_lvl     = next(
        (lvl for lvl in reversed(ECO_LEVELS) if lvl["rank"] == current_rank + 1),
        None,
    )
    if next_lvl is None:
        return {"next_label": None, "points_needed": 0, "progress_pct": 100}

    band_start = current["min"]
    band_end   = next_lvl["min"]
    band_size  = band_end - band_start
    progress   = total_points - band_start
    pct        = min(100, int((progress / band_size) * 100)) if band_size else 100

    return {
        "next_label":    next_lvl["label"],
        "points_needed": max(0, next_lvl["min"] - total_points),
        "progress_pct":  pct,
    }


def eligible_to_claim(total_points: int, required_points: int) -> bool:
    return total_points >= required_points
