"""
app/services/supabase_client.py

Raw async Supabase REST layer.
Schema: id, title, description, code, required_points, category,
        discount_label, expiry_note, status, reserved_by, reserved_at,
        redeemed_at, created_at

status values: 'available' | 'reserved' | 'redeemed'

Env vars are read lazily inside functions — never at import time — so
load_dotenv() in main.py always runs first.
"""

import os
import time
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

CACHE_TTL = 300  # 5 min
_cache: Dict[str, Any] = {}


def _url() -> str:
    v = os.getenv("SUPABASE_URL", "")
    if not v:
        raise RuntimeError("SUPABASE_URL env var is not set.")
    return v


def _key() -> str:
    v = os.getenv("SUPABASE_ANON_KEY", "")
    if not v:
        raise RuntimeError("SUPABASE_ANON_KEY env var is not set.")
    return v


def _headers() -> Dict[str, str]:
    key = _key()
    return {
        "apikey":        key,
        "Authorization": f"Bearer {key}",
        "Content-Type":  "application/json",
        "Prefer":        "return=representation",
    }


def _rest(table: str) -> str:
    return f"{_url()}/rest/v1/{table}"


def _bust() -> None:
    _cache.clear()


# ── Low-level ─────────────────────────────────────────────────────────────────

async def _get(table: str, params: Dict) -> List[Dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(_rest(table), headers=_headers(), params=params)
        r.raise_for_status()
        return r.json()


async def _patch(table: str, payload: Dict, params: Dict) -> List[Dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.patch(
            _rest(table), headers=_headers(), json=payload, params=params
        )
        r.raise_for_status()
        _bust()
        return r.json()


# ── Queries ───────────────────────────────────────────────────────────────────

async def fetch_available_coupons() -> List[Dict]:
    """
    All active, unclaimed coupons — cached for CACHE_TTL seconds.
    Filtering by user points happens in the service layer so the cache
    is shared across all users.
    """
    cached = _cache.get("available")
    if cached and (time.monotonic() - cached["ts"]) < CACHE_TTL:
        return cached["data"]

    rows = await _get("coupons", {
        "status": "eq.available",
        "select": "*",
        "order":  "required_points.asc,created_at.asc",
    })
    _cache["available"] = {"ts": time.monotonic(), "data": rows}
    return rows


async def fetch_coupon_by_id_fresh(coupon_id: str) -> Optional[Dict]:
    """No-cache — always used before mutations."""
    rows = await _get("coupons", {"id": f"eq.{coupon_id}", "select": "*"})
    return rows[0] if rows else None


async def fetch_reserved_by_user(user_id: str) -> List[Dict]:
    """All coupons owned (reserved or redeemed) by this user."""
    return await _get("coupons", {
        "reserved_by": f"eq.{user_id}",
        "select":      "*",
        "order":       "reserved_at.desc",
    })


# ── Atomic reserve ────────────────────────────────────────────────────────────

async def atomic_reserve(coupon_id: str, user_id: str) -> Optional[Dict]:
    """
    UPDATE coupons
       SET status='reserved', reserved_by=:uid, reserved_at=now()
     WHERE id=:id AND status='available'

    Returns the updated row, or None if the race was lost.
    Postgres evaluates the WHERE atomically — duplicate ownership is impossible.
    """
    rows = await _patch(
        "coupons",
        payload={
            "status":      "reserved",
            "reserved_by": user_id,
            "reserved_at": datetime.now(timezone.utc).isoformat(),
        },
        params={
            "id":     f"eq.{coupon_id}",
            "status": "eq.available",
        },
    )
    return rows[0] if rows else None


# ── Redeem ────────────────────────────────────────────────────────────────────

async def atomic_redeem(coupon_id: str, user_id: str) -> Optional[Dict]:
    """
    UPDATE coupons
       SET status='redeemed', redeemed_at=now()
     WHERE id=:id AND reserved_by=:uid AND status='reserved'

    Ownership + state guard in one atomic operation.
    """
    rows = await _patch(
        "coupons",
        payload={
            "status":      "redeemed",
            "redeemed_at": datetime.now(timezone.utc).isoformat(),
        },
        params={
            "id":          f"eq.{coupon_id}",
            "reserved_by": f"eq.{user_id}",
            "status":      "eq.reserved",
        },
    )
    return rows[0] if rows else None
