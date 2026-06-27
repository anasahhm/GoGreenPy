"""
app/schemas/rewards.py
Pydantic schemas for the Eco Rewards & Coupon system.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ── Coupon ────────────────────────────────────────────────────────────────────

class CouponOut(BaseModel):
    id: str
    title: str
    description: str
    required_points: int
    code: Optional[str] = None          # only exposed when RESERVED/REDEEMED
    category: str
    discount_label: str
    expiry_note: str
    status: str                          # DB raw: available | reserved | redeemed
    display_status: str                  # frontend: AVAILABLE|LOCKED|RESERVED|REDEEMED|SOLD_OUT
    points_gap: int = 0
    reserved_by: Optional[str] = None
    reserved_at: Optional[datetime] = None
    redeemed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    def model_post_init(self, __context: Any) -> None:
        # Hide the code unless the requesting user owns this coupon
        if self.display_status not in ("RESERVED", "REDEEMED"):
            object.__setattr__(self, "code", None)


# ── Reward transaction (MongoDB) ──────────────────────────────────────────────

class RewardTransaction(BaseModel):
    id: Optional[str] = None
    user_id: str
    points_delta: int
    points_after: int
    reason: str
    overall_rating: str
    impact_log_id: Optional[str] = None
    newly_claimed_coupons: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── Eco level ─────────────────────────────────────────────────────────────────

class EcoLevelOut(BaseModel):
    label: str
    rank: int
    next_label: Optional[str] = None
    points_needed: int = 0
    progress_pct: int = 0


# ── Endpoint responses ────────────────────────────────────────────────────────

class RewardsMeResponse(BaseModel):
    total_points: int
    eco_level: EcoLevelOut
    owned_coupons: List[CouponOut]
    recent_transactions: List[RewardTransaction]


class MarketplaceResponse(BaseModel):
    coupons: List[CouponOut]
    total_points: int
    has_available: bool


class ClaimResponse(BaseModel):
    success: bool
    message: str
    coupon: CouponOut


class RedeemResponse(BaseModel):
    success: bool
    message: str
    coupon_id: str
    code: str


class RewardHistoryResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[RewardTransaction]


# ── Embedded in ImpactResponse ────────────────────────────────────────────────

class RewardSummary(BaseModel):
    points_delta: int
    total_points: int
    eco_level: str
    newly_claimed_coupons: List[CouponOut] = Field(default_factory=list)
