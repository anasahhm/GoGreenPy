"""
app/services/coupon_service.py

Coupon domain logic.  All business rules live here.
Routes call this; this calls supabase_client.
"""

from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status as http_status

from app.services import supabase_client as sb


# ── Status helpers ────────────────────────────────────────────────────────────

def _user_display_status(coupon: Dict, user_id: str, total_points: int) -> str:
    """
    Map raw DB status + context to frontend-facing status string.

    AVAILABLE  — in public marketplace, user can claim
    LOCKED     — in public marketplace, user lacks points
    RESERVED   — owned by current user, not yet redeemed
    REDEEMED   — owned by current user, already redeemed
    SOLD_OUT   — taken by someone else, gone from this user's view
    """
    db_status = coupon.get("status")
    owner     = coupon.get("reserved_by")

    if owner == user_id:
        return "REDEEMED" if db_status == "redeemed" else "RESERVED"

    if db_status in ("reserved", "redeemed"):
        # Owned by another user — shouldn't appear in marketplace but safety net
        return "SOLD_OUT"

    # status == 'available'
    if total_points < coupon.get("required_points", 0):
        return "LOCKED"

    return "AVAILABLE"


def _enrich(coupon: Dict, user_id: str, total_points: int) -> Dict:
    c = dict(coupon)
    c["display_status"] = _user_display_status(coupon, user_id, total_points)
    c["points_gap"]     = max(0, coupon.get("required_points", 0) - total_points)
    return c


# ── Marketplace ───────────────────────────────────────────────────────────────

async def get_marketplace(user_id: str, total_points: int) -> List[Dict]:
    """
    Returns:
      - All available coupons (enriched with AVAILABLE or LOCKED state)
      - Plus all coupons owned by this user (RESERVED / REDEEMED)
    Sold-out coupons (reserved by others) are excluded entirely.
    """
    available = await sb.fetch_available_coupons()
    owned     = await sb.fetch_reserved_by_user(user_id)

    owned_ids = {c["id"] for c in owned}
    combined  = list(owned) + [c for c in available if c["id"] not in owned_ids]

    return [_enrich(c, user_id, total_points) for c in combined]


# ── Claim / reserve ───────────────────────────────────────────────────────────

async def claim_coupon(coupon_id: str, user_id: str, total_points: int) -> Dict:
    """
    Full claim lifecycle:
      1. Fresh DB read (never use cache for mutations)
      2. Existence check
      3. Already-owned idempotency
      4. Status guard (must be 'available')
      5. Points eligibility
      6. Atomic reserve (race-safe)
    """
    coupon = await sb.fetch_coupon_by_id_fresh(coupon_id)

    if not coupon:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Coupon not found.")

    # Idempotent — already owned by this user
    if coupon.get("reserved_by") == user_id:
        return _enrich(coupon, user_id, total_points)

    if coupon.get("status") != "available":
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            "This reward has already been claimed by someone else.",
        )

    if total_points < coupon.get("required_points", 0):
        gap = coupon["required_points"] - total_points
        raise HTTPException(
            http_status.HTTP_403_FORBIDDEN,
            f"You need {gap} more point(s) to claim this reward.",
        )

    reserved = await sb.atomic_reserve(coupon_id, user_id)
    if reserved is None:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            "This reward was just taken. Check back — new drops are added regularly.",
        )

    return _enrich(reserved, user_id, total_points)


# ── Redeem ────────────────────────────────────────────────────────────────────

async def redeem_coupon(coupon_id: str, user_id: str) -> Dict:
    """
    Mark an owned coupon as redeemed.
    Ownership and state are enforced atomically in Supabase.
    """
    coupon = await sb.fetch_coupon_by_id_fresh(coupon_id)

    if not coupon:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, "Coupon not found.")

    if coupon.get("reserved_by") != user_id:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "You do not own this reward.")

    if coupon.get("status") == "redeemed":
        raise HTTPException(http_status.HTTP_409_CONFLICT, "Already redeemed.")

    redeemed = await sb.atomic_redeem(coupon_id, user_id)
    if redeemed is None:
        raise HTTPException(
            http_status.HTTP_409_CONFLICT,
            "Redemption failed — reward may have already been redeemed.",
        )

    return redeemed


# ── User's owned rewards ──────────────────────────────────────────────────────

async def get_my_rewards(user_id: str, total_points: int) -> List[Dict]:
    owned = await sb.fetch_reserved_by_user(user_id)
    return [_enrich(c, user_id, total_points) for c in owned]
