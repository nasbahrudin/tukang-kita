# Database / Seed Scripts — Tukang Kita

SQL scripts for the soft-launch **seed (social-proof) system**. All fictitious
data is tagged `is_seed = true` so it's cleanly separable from real data and
removable in one command at launch.

See `HANDOVER.md` Section 12 for the full explanation.

## Run order (in the Supabase SQL editor)

| # | File | What it does | When to run |
|---|------|--------------|-------------|
| 1 | `01_schema_is_seed.sql` | Adds `is_seed` column to `users` + `bookings` | Once, first |
| 2 | `02_seed_data.sql` | Inserts ~14 seed users, 16 jobs, 13 assignments. Safe to re-run (clears prior seed first) | Once (or to reseed) |
| 3 | `03_recent_activity_function.sql` | Creates `recent_activity()` — a `SECURITY DEFINER` function returning sanitized, seed-only social proof. Self-freshening (rotates names + recomputes recency by day; no scheduled job needed) | Once |
| 99 | `99_teardown.sql` | Wipes ALL seed data (`is_seed = true` only). Real data untouched | At real launch |

## Safety notes

- `recent_activity()` filters `is_seed = true`, so even though it bypasses RLS
  (it's `SECURITY DEFINER`), it **cannot** leak real customer data. It returns
  only job type, area (first address segment), tukang first name, and a
  computed `days_ago` — no full address, phone, or customer name.
- Seed users have `@tukangkita.local` emails and no Supabase Auth records, so
  they cannot log in. They exist only as display data.
- After teardown, consider tightening the Loker window from 14 days back to 7
  (in `getAvailableJobs` in `src/lib/supabase.js`).