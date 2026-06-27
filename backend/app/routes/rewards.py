"""
app/routes/rewards.py
Rewards & Coupon endpoints — prefix /rewards
"""

import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.database import get_database
from app.services import coupon_service
from app.utils.rewards import get_eco_level, next_level_info
from app.schemas.rewards import (
    CouponOut,
    ClaimResponse,
    RedeemResponse,
    RewardsMeResponse,
    MarketplaceResponse,
    RewardHistoryResponse,
    RewardTransaction,
    EcoLevelOut,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Profile helper ────────────────────────────────────────────────────────────

async def _profile(db, user_id: str) -> dict:
    doc = await db.reward_profiles.find_one({"user_id": user_id})
    if not doc:
        doc = {
            "user_id":       user_id,
            "total_points":  0,
            "created_at":    datetime.utcnow(),
            "updated_at":    datetime.utcnow(),
        }
        res = await db.reward_profiles.insert_one(doc)
        doc["_id"] = res.inserted_id
    return doc


# ── GET /rewards/me ───────────────────────────────────────────────────────────

@router.get("/me", response_model=RewardsMeResponse)
async def get_my_rewards_summary(current_user: dict = Depends(get_current_user)):
    db           = await get_database()
    prof         = await _profile(db, current_user["id"])
    total_points = prof.get("total_points", 0)
    level        = get_eco_level(total_points)
    nxt          = next_level_info(total_points)

    owned_raw = await coupon_service.get_my_rewards(current_user["id"], total_points)
    owned     = []
    for c in owned_raw:
        try:
            owned.append(CouponOut(**c))
        except Exception:
            pass

    cursor = (
        db.reward_transactions
        .find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .limit(10)
    )
    txns = [
        RewardTransaction(
            id=str(t["_id"]),
            user_id=t["user_id"],
            points_delta=t["points_delta"],
            points_after=t["points_after"],
            reason=t["reason"],
            overall_rating=t["overall_rating"],
            impact_log_id=t.get("impact_log_id"),
            newly_claimed_coupons=t.get("newly_claimed_coupons", []),
            created_at=t["created_at"],
        )
        for t in await cursor.to_list(length=10)
    ]

    return RewardsMeResponse(
        total_points=total_points,
        eco_level=EcoLevelOut(
            label=level["label"],
            rank=level["rank"],
            next_label=nxt["next_label"],
            points_needed=nxt["points_needed"],
            progress_pct=nxt["progress_pct"],
        ),
        owned_coupons=owned,
        recent_transactions=txns,
    )


# ── GET /rewards/marketplace ──────────────────────────────────────────────────

@router.get("/marketplace", response_model=MarketplaceResponse)
async def get_marketplace(current_user: dict = Depends(get_current_user)):
    db           = await get_database()
    prof         = await _profile(db, current_user["id"])
    total_points = prof.get("total_points", 0)

    coupons_raw = await coupon_service.get_marketplace(current_user["id"], total_points)
    coupons     = []
    for c in coupons_raw:
        try:
            coupons.append(CouponOut(**c))
        except Exception:
            pass

    has_available = any(c.display_status in ("AVAILABLE", "LOCKED") for c in coupons)

    return MarketplaceResponse(
        coupons=coupons,
        total_points=total_points,
        has_available=has_available,
    )


# ── POST /rewards/claim/{coupon_id} ───────────────────────────────────────────

@router.post("/claim/{coupon_id}", response_model=ClaimResponse)
async def claim_coupon(
    coupon_id: str,
    current_user: dict = Depends(get_current_user),
):
    db           = await get_database()
    prof         = await _profile(db, current_user["id"])
    total_points = prof.get("total_points", 0)

    # coupon_service raises HTTPException on any failure
    claimed = await coupon_service.claim_coupon(coupon_id, current_user["id"], total_points)

    return ClaimResponse(
        success=True,
        message=f"'{claimed['title']}' is now yours.",
        coupon=CouponOut(**claimed),
    )


# ── POST /rewards/redeem/{coupon_id} ──────────────────────────────────────────

@router.post("/redeem/{coupon_id}", response_model=RedeemResponse)
async def redeem_coupon(
    coupon_id: str,
    current_user: dict = Depends(get_current_user),
):
    redeemed = await coupon_service.redeem_coupon(coupon_id, current_user["id"])

    return RedeemResponse(
        success=True,
        message="Coupon redeemed successfully.",
        coupon_id=redeemed["id"],
        code=redeemed["code"],
    )


# ── GET /rewards/history ──────────────────────────────────────────────────────

@router.get("/history", response_model=RewardHistoryResponse)
async def get_reward_history(
    page:      int = Query(1,  ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db    = await get_database()
    total = await db.reward_transactions.count_documents({"user_id": current_user["id"]})
    skip  = (page - 1) * page_size

    cursor = (
        db.reward_transactions
        .find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(page_size)
    )
    txns = [
        RewardTransaction(
            id=str(t["_id"]),
            user_id=t["user_id"],
            points_delta=t["points_delta"],
            points_after=t["points_after"],
            reason=t["reason"],
            overall_rating=t["overall_rating"],
            impact_log_id=t.get("impact_log_id"),
            newly_claimed_coupons=t.get("newly_claimed_coupons", []),
            created_at=t["created_at"],
        )
        for t in await cursor.to_list(length=page_size)
    ]

    return RewardHistoryResponse(total=total, page=page, page_size=page_size, data=txns)
