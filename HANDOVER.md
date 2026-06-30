# Tukang Kita — Handover & Operations Guide

_Last updated: 30 June 2026. Maintained by Nas (founder/operator). This document is the single source of truth for anyone joining the project — developer or operations staff._

---

## 1. What This Is (Read First)

Tukang Kita is a mobile-first marketplace connecting customers (pelanggan) with helpers (tukang) in **Batam, Indonesia**. A customer posts a request for help; a tukang browses available requests, accepts one, does the job, and gets rated.

The vision is broader than handyman work alone. It is heading toward a general "help with anything" marketplace (errands, babysitting, queueing, helping the elderly, etc.), which is why customer-facing copy uses the word **"bantuan"** (help) rather than "pekerjaan" (job). Keep this in mind before narrowing any language back to trades-only.

**Current phase:** Manual soft launch. Onboarding tukang in person around Batam, leading with a 0%-commission pitch. Payments are deliberately NOT live yet — see Section 7.

---

## 2. The Stack (Developer Section)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite | Single-page app |
| Database & Auth | Supabase (PostgreSQL) | Project URL: https://hpviafjptzyzihucetsy.supabase.co |
| Hosting / CI-CD | Vercel | Auto-deploys on every push to `main` |
| Payments | Midtrans (escrow) | Client scaffold only; backend NOT built yet |
| Disputes / verification | WhatsApp (manual) | Admin number: 6281222145633 |

**Live URL:** https://tukang-kita-tau.vercel.app
(Note the `-tau` suffix. The bare `tukang-kita.vercel.app` belongs to an unrelated party — do not use or share it.)

**Repository:** github.com/nasbahrudin/tukang-kita (branch: `main`)

---

## 3. Project Structure

```
tukang-kita/
├── index.html
├── package.json
├── vite.config.js
├── .env.local          (secrets — NOT in git, see Section 5)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css         (global styles + brand color variable)
│   ├── lib/
│   │   ├── supabase.js  (Supabase client + queries)
│   │   └── midtrans.js  (payment scaffold)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx   (role-aware: customer vs tukang)
│   │   ├── PostJob.jsx
│   │   ├── JobBoard.jsx    (Loker — tukang job board)
│   │   ├── JobDetail.jsx
│   │   └── MyJobs.jsx
│   └── components/
│       ├── Header.jsx
│       ├── JobCard.jsx
│       ├── DeliveryOrder.jsx
│       ├── RatingForm.jsx
│       ├── TrustStrip.jsx
│       └── RecentActivity.jsx   (sanitized social-proof band — see Section 12)
```

---

## 4. Database Schema (Supabase)

Six tables: `users`, `bookings`, `job_assignments`, `payments`, `ratings`, `delivery_orders`.

The `users` table includes a `verified` boolean (default `false`) and a `role` field (`customer` or `tukang`). The `bookings` table is the core operational table holding job type, status, address, schedule, and tukang assignments.

**Added 30 June 2026:**
- Both `users` and `bookings` have an `is_seed boolean default false` column. Real data is `false`; all fictitious soft-launch seed data is `true`. See Section 12 for the seed system and teardown.
- A `SECURITY DEFINER` SQL function `public.recent_activity()` returns sanitized, seed-only social-proof rows (job type, area, tukang first name, days_ago). It powers the dashboard activity band. See Section 12.

---

## 5. Environment Variables

All variables use the `VITE_` prefix and live in `.env.local` (which is gitignored — never commit it). On Vercel, the same variables are set in the project's Environment Variables settings.

```
VITE_SUPABASE_URL=https://hpviafjptzyzihucetsy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_2PkDWlNV6iU9jnYkqqWiqw_ppn8I5kP
VITE_MIDTRANS_CLIENT_KEY=(from Midtrans dashboard)
VITE_ADMIN_WHATSAPP=6281222145633
```

The Supabase anon/publishable key above is safe for the browser (it is the public key). The Midtrans **Server Key** must NEVER be sent to the client — see Section 8.

---

## 6. How to Make a Change (Deploy Cycle)

1. Edit the relevant file in `src/`
2. In the terminal:
   ```
   git add <file>
   git commit -m "describe the change"
   git push
   ```
3. Vercel auto-deploys in 1–2 minutes
4. Refresh the live URL to confirm

To change the entire app's brand color, edit one line at the top of `App.css`:
`--brand: #72243E;` (current colour: maroon). Everything references this variable.

---

## 7. What's Built vs. Not Built

**Live and working:** signup, login, manual admin verification, role-based dashboards (customer vs tukang), job posting, tukang job board (Loker), job acceptance, delivery-order confirmation, ratings, WhatsApp dispute escalation.

**Scaffolded but NOT finished:** Midtrans payments. The client-side code exists, but charging real money requires a **backend serverless function** that has not been built. This is the single biggest remaining technical gap and the main reason to hire a backend developer.

**Deliberately paused:** Live payments are on hold until real-user demand is validated. Do not rush payment integration before there are real users.

---

## 8. Critical Rules & Gotchas (Do Not Break These)

- **Supabase "Confirm email" must stay OFF.** If turned on, the signup flow breaks.
- **Never send the Midtrans Server Key to the browser.** A previous version exposed it client-side; it was caught and removed. Backend-only secrets stay backend-only.
- **"Accepted" status means COMPLETED** in the booking lifecycle. Do not reinterpret it.
- **Use the `-tau` URL.** The bare `tukang-kita.vercel.app` is someone else's site.
- **Customer copy = "bantuan", tukang copy = "pekerjaan/Loker."** This asymmetry is intentional.

---

## 9. Operations Playbook (Non-Technical Staff Section)

**Verifying a new user (manual, for MVP):**
1. Open Supabase → `users` table
2. Find the new signup (their `verified` field will be `false`)
3. If legitimate, change `verified` to `true`. If spam, leave as `false`.
4. The user's dashboard updates automatically — they can then post or accept jobs.

**Job status lifecycle (corrected 30 June 2026 to match live data):**
- **available** — job posted by customer, visible in Loker, tukang can accept
- **accepted** — job is full (all needed tukang slots filled); work in progress. NOTE: a job with `tukang_needed > 1` stays `available` until all slots fill, even though it already has one tukang.
- **completed** — both sides confirmed via delivery order; final state
- **cancelled** — customer soft-cancelled an un-taken job (row kept, hidden from all views). See Section 12.

(Historical note: an older version of this doc said "Accepted = COMPLETED". That described an earlier lifecycle. The live app now uses available → accepted → completed, with cancelled as a soft-delete state.)

**Handling a dispute:** Disputes escalate via WhatsApp to the admin number 6281222145633. Respond there.

**WhatsApp number 6281222145633** is used for both manual verification messages and dispute escalation.

---

## 10. Roadmap (Where This Is Going)

1. **Phase 1 (current):** Manual soft launch — onboard tukang in person in Batam
2. **Phase 2:** Payment integration & monetization (build the Midtrans serverless function)
3. **Phase 3:** Build Batam density & defensibility
4. **Phase 4:** Expand to more services and cities

Longer-term ideas (parked, not committed): tukang upskilling section, community goodwill projects, a "Donate / Donate a Task" social-good feature promoted via TikTok, anti-scammer verification, and additional service categories (pest control, cleaning, etc.).

---

## 11. Open Items for a New Developer

- Build the Midtrans serverless backend function for live payment charges (Phase 2)
- Add a `vercel.json` rewrite so refreshing on any route (e.g. `/dashboard`) doesn't 404
- Add friendly empty states (e.g. "Bantuan Saya" when there are no items yet)
- Harden row-level security / row owners on the Supabase tables
- Lightweight admin dashboard for operational monitoring
- Acceptance race-condition safety (two tukang accepting the same job simultaneously)

---

## 12. Session Log — 30 June 2026 (job lifecycle UI + soft-launch social proof)

This session shipped a complete two-sided job-lifecycle UI and a safe, fictitious "social proof" layer for soft launch. All changes are live and verified on the `-tau` site.

### A. What shipped (app code)

- **Loker (JobBoard / JobCard):** taken jobs now show "Diterima oleh [tukang]" and grey out ("Sudah Diambil") when full. `getAvailableJobs` widened to a **14-day** posting window and shows taken jobs even past their needed-date (social proof), while hiding *untaken* jobs whose needed-date has passed.
- **Customer MyJobs card ("Bantuan Saya"):** real status pill (Menunggu tukang / Diterima / Selesai / Kadaluarsa), both **Diposting** and **Dibutuhkan** dates, "Dikerjakan oleh [tukang]" once accepted, and an expiry (Kadaluarsa) flag. Rule: a job with any assignment is never "expired"; accepted beats expired.
- **Tukang MyJobs card ("Pekerjaan Saya"):** dedicated card (separate from the customer card) with customer name, **WhatsApp "Hubungi Pelanggan"** button (pre-filled Bahasa message), Maps, job description, and Tandai Selesai. Customer phone is only exposed to a tukang *after* they accept (privacy-by-acceptance).
- **Cancel / Batalkan:** customers can soft-cancel an un-taken job (inline confirm → `status = 'cancelled'`, row kept, never hard-deleted). For an already-taken job the button becomes "Hubungi admin untuk batalkan" → WhatsApp to admin (fairness to the tukang). `cancelJob()` lives in `supabase.js`.
- **Context-aware Header:** brand "Tukang Kita" on the dashboard; on sub-pages a "‹" back arrow (`navigate(-1)` with dashboard fallback) plus the page title (role-aware for /my-jobs).
- **Dashboard activity band (RecentActivity.jsx):** sanitized social-proof strip, fed by the `recent_activity()` RPC. Shows "[Nama] mengambil [Job] di [Area] · N hari lalu".

### B. The seed / social-proof system (IMPORTANT for launch)

To make the soft-launch feed feel alive, the DB is seeded with **fictitious** users and jobs, all tagged `is_seed = true`. This is intentional and must be cleaned up before / at real launch.

Three SQL scripts were run (kept in the repo / outputs as `seed_step1..3`):
1. **Schema:** added `is_seed` to `users` and `bookings`.
2. **Seed data:** ~14 seed users (8 tukang, 6 customers), 16 jobs (13 taken, 3 open), 13 assignments. Seed users have `@tukangkita.local` emails and cannot log in (no auth records).
3. **Self-freshening function:** `recent_activity()` is `SECURITY DEFINER`, returns ONLY sanitized seed-only rows (job type, area = first address segment, tukang first name, computed days_ago). It **rotates names by day and computes recency**, so the feed never goes stale and needs no scheduled job. It filters `is_seed = true`, so it cannot leak real customer data even though it bypasses RLS.

**Why RLS blocks the full greyed feed:** a tukang can only read `available` jobs + jobs they're personally assigned to. Other tukang's `accepted` jobs are hidden by design. The activity band exists *because* of this — it surfaces sanitized social proof without loosening the table policy.

### C. SEED TEARDOWN — run this before real launch

To wipe ALL fictitious data in one go (safe; touches only `is_seed = true` rows):

```sql
delete from job_assignments where booking_id in (select id from bookings where is_seed = true);
delete from bookings where is_seed = true;
delete from users where is_seed = true;
-- Optional: drop the social-proof function once real activity exists
-- drop function if exists public.recent_activity();
```

Real data (`is_seed = false`) is untouched. After teardown, consider tightening the Loker window from 14 days back to 7 (in `getAvailableJobs`).

### D. Still parked (by choice)

- **Edit** a posted job, and **transfer** a job to another tukang — transfer belongs with the emergency/replacement flow (Master Fly-by §7C), designed deliberately later.
- Multi-tukang slot UI exists in code (JobCard "butuh N lagi") but no live job uses `tukang_needed > 1` yet.
