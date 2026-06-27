-- ════════════════════════════════════════════════════════════════════════════
-- FILE: supabase/schema.sql
-- Run this in the Supabase SQL Editor once to set up the coupons table.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Create the coupons table ────────────────────────────────────────────

create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  description     text        not null,
  code            text        not null,
  required_points integer     not null default 0,
  category        text        not null,
  discount_label  text        not null,
  expiry_note     text        not null,

  -- inventory / ownership
  status          text        not null default 'available'
                    check (status in ('available', 'reserved', 'redeemed')),
  reserved_by     text        null,   -- GoGreenPy user_id (MongoDB ObjectId string)
  reserved_at     timestamptz null,
  redeemed_at     timestamptz null,

  created_at      timestamptz not null default now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────────────

-- Fast lookup of all available coupons (the most-read query)
create index if not exists idx_coupons_status
  on public.coupons (status)
  where status = 'available';

-- Fast lookup of coupons owned by a specific user
create index if not exists idx_coupons_reserved_by
  on public.coupons (reserved_by)
  where reserved_by is not null;

-- ── 3. Row Level Security ─────────────────────────────────────────────────
--
-- We use the anon key from the backend only (no client-side Supabase calls).
-- RLS is enabled but all access goes through the service role via the backend,
-- so we allow SELECT / UPDATE freely for the anon role here.
-- For production: replace with server-side service_role key and tighter policies.

alter table public.coupons enable row level security;

-- Allow backend (anon key) to read all rows
create policy "anon_read" on public.coupons
  for select to anon using (true);

-- Allow backend to update (claim / redeem) — row-level guards are enforced
-- in the WHERE clause of each PATCH, not here
create policy "anon_update" on public.coupons
  for update to anon using (true);

-- ── 4. Seed example coupons (10 unique inventory items) ──────────────────
--
-- Each row is ONE physical reward. Add more rows to increase inventory.
-- Replace codes with real brand codes you've sourced before going live.

insert into public.coupons
  (title, description, code, required_points, category, discount_label, expiry_note)
values
  ('Green Bag Discount',
   '10% off reusable bags & bamboo containers at EcoStore.',
   'GREENBAG10', 20, 'Sustainable Shopping', '10% OFF',
   'Valid 90 days after claim'),

  ('Organic Basket Saver',
   '₹150 off your first organic grocery order above ₹999 at FreshRoots.',
   'ORGANIC150', 20, 'Organic Food', '₹150 OFF',
   'Single use, valid 60 days'),

  ('Recycle Double Credits',
   'Double drop-off credits at BinIt recycling centres this month.',
   'RECYCLE2X', 20, 'Recycling', '2× CREDITS',
   'Valid until end of current month'),

  ('EV Ride Credit',
   '₹200 ride credit on BlueCharge EV cab bookings.',
   'EVRIDE200', 50, 'EV Rides', '₹200 CREDIT',
   'Valid 30 days after claim'),

  ('Solar Plan Kickstart',
   'Free consultation + ₹500 off installation with SunGrid home solar.',
   'SUNGRID500', 50, 'Green Energy', '₹500 OFF',
   'Valid 6 months from claim'),

  ('Eco Rail Upgrade',
   '15% off carbon-neutral train journeys booked via GreenRail.',
   'GREENRAIL15', 50, 'Eco Travel', '15% OFF',
   'Valid 90 days from claim'),

  ('Home Energy Audit',
   '₹1000 off a full home energy audit + smart power-strip installation.',
   'AUDIT1K', 100, 'Green Energy', '₹1000 OFF',
   'Valid 1 year from claim'),

  ('Elite Organic Box',
   '3-month weekly organic produce box at 25% off.',
   'ELITEBOX25', 100, 'Organic Food', '25% OFF',
   'Subscription starts within 30 days'),

  ('Carbon Offset Flight',
   'Full carbon offset for one domestic flight via ClearSky.',
   'CLEARSKY100', 100, 'Eco Travel', 'FULL OFFSET',
   'Single use, valid 1 year'),

  ('Planet Tree Kit',
   'Free native-species sapling kit delivered to your door from GreenRoots.',
   'TREEKIT', 20, 'Sustainable Shopping', 'FREE KIT',
   'While stocks last');


-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION GUIDE (from hardcoded coupons.py)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Files REMOVED:
--   backend/app/data/coupons.py           ← deleted (hardcoded list)
--
-- Files REPLACED / REWRITTEN:
--   backend/app/services/supabase_client.py  ← NEW raw HTTP layer
--   backend/app/services/coupon_service.py   ← NEW domain logic layer
--   backend/app/utils/rewards.py             ← stripped old coupon helpers
--   backend/app/schemas/rewards.py           ← updated schemas
--   backend/app/routes/rewards.py            ← new endpoints (claim, marketplace)
--   backend/app/routes/impact.py             ← auto-claim on point crossing
--
-- Files ADDED:
--   backend/requirements.txt                 ← httpx==0.27.0 added
--   backend/.env                             ← SUPABASE_URL, SUPABASE_ANON_KEY
--   supabase/schema.sql                      ← this file
--
-- Frontend files REPLACED:
--   frontend/src/pages/Rewards.jsx           ← full rewrite (3 tabs)
--   frontend/src/components/rewards/CouponGrid.jsx
--   frontend/src/components/rewards/RewardUnlockPopup.jsx
--   frontend/src/components/rewards/RewardSummaryWidget.jsx
--   frontend/src/components/rewards/RewardHistory.jsx
--
-- Frontend files ADDED:
--   frontend/src/components/rewards/CouponSkeleton.jsx
--   frontend/src/components/rewards/MarketplaceEmpty.jsx
--
-- Frontend files UPDATED:
--   frontend/src/services/api.js             ← new endpoint names
--   frontend/src/pages/Analyzer.jsx          ← field name fix
--
-- Unchanged (no modification needed):
--   frontend/src/App.jsx                     ← route already added
--   frontend/src/components/Navbar.jsx       ← link already added
--   frontend/src/components/rewards/RewardPointsCard.jsx
--   frontend/src/components/rewards/EcoBadge.jsx
--   backend/app/main.py
--   backend/app/database.py
--   backend/app/auth/
--
-- ════════════════════════════════════════════════════════════════════════════
-- ENVIRONMENT VARIABLES REQUIRED
-- ════════════════════════════════════════════════════════════════════════════
--
-- SUPABASE_URL       https://xxxxxxxxxxxx.supabase.co
-- SUPABASE_ANON_KEY  eyJhbGciO...  (from Supabase → Settings → API → anon key)
--
-- ════════════════════════════════════════════════════════════════════════════
-- CONCURRENCY PROTECTION EXPLANATION
-- ════════════════════════════════════════════════════════════════════════════
--
-- Race condition prevention is handled at the DATABASE level, not the app:
--
--   PATCH /rest/v1/coupons
--     ?id=eq.{coupon_id}
--     &status=eq.available       ← guard: only matches if still available
--
-- Postgres evaluates the WHERE clause atomically within its MVCC engine.
-- If two requests arrive simultaneously for the same coupon_id:
--   - Request A wins → row updated, status='reserved', returns 1 row
--   - Request B's WHERE clause no longer matches → returns 0 rows
-- Backend checks: if rows == [] → 409 Conflict, notify user.
-- No application-level locking needed. No duplicate ownership possible.
--
-- ════════════════════════════════════════════════════════════════════════════
-- SETUP STEPS (one-time)
-- ════════════════════════════════════════════════════════════════════════════
--
-- 1. Go to https://supabase.com → New project (free tier)
-- 2. SQL Editor → paste and run this entire file
-- 3. Settings → API → copy Project URL + anon key
-- 4. Paste into backend/.env as SUPABASE_URL and SUPABASE_ANON_KEY
-- 5. pip install -r requirements.txt  (picks up httpx)
-- 6. Restart the FastAPI server
-- 7. Add real coupon codes via Supabase Table Editor as needed
