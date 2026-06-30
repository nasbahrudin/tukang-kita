-- ============================================================
-- TUKANG KITA — SEED TEARDOWN
-- Wipes ALL fictitious soft-launch data in one go. Touches only
-- is_seed = true rows, so real data (is_seed = false) is untouched.
-- Run this before / at real launch, once real activity exists.
-- ============================================================

delete from job_assignments where booking_id in (select id from bookings where is_seed = true);
delete from bookings where is_seed = true;
delete from users where is_seed = true;

-- Optional: drop the social-proof function once you no longer want the
-- seed activity band (or once it's replaced by real activity).
-- drop function if exists public.recent_activity();

-- Verify nothing seed-tagged remains (all counts should be 0)
select
  (select count(*) from users    where is_seed) as seed_users_left,
  (select count(*) from bookings where is_seed) as seed_jobs_left;