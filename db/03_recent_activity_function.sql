-- ============================================================
-- TUKANG KITA — SEED SCRIPT 3 of 3: self-freshening activity feed
-- Replaces recent_activity() with a version that is FRESH BY CONSTRUCTION:
--   * "days_ago" is COMPUTED from a stable per-row offset, not from a stored
--     timestamp — so the feed always looks recent no matter how long ago the
--     seed rows were inserted. It can never age out of the window.
--   * The tukang NAME shown on each job ROTATES by day, so a returning user
--     sees different names over time (your "evergreen" requirement).
-- Still seed-only and sanitized: job type, area, first name, days_ago.
-- No scheduled job, no manual re-run needed. Run this ONCE to replace 3a.
-- ============================================================

create or replace function public.recent_activity()
returns table (
  job_type   text,
  area       text,
  tukang     text,
  days_ago   int
)
language sql
security definer
set search_path = public
as $$
  with
  -- Today's rotation offset: changes every day, stable within a day.
  rot as (
    select (extract(doy from now()))::int as day_offset
  ),
  -- All seed tukang first names, given a stable index 0..N-1.
  tukang_pool as (
    select
      split_part(name, ' ', 1) as first_name,
      (row_number() over (order by id) - 1) as idx,
      count(*) over () as n
    from users
    where is_seed = true and role = 'tukang'
  ),
  -- Seed jobs, each with a stable position. We DON'T use the stored
  -- assignment; we re-pair names by rotation so they change daily.
  seed_jobs as (
    select
      b.job_type,
      trim(split_part(b.address, ',', 1)) as area,
      (row_number() over (order by b.id) - 1) as pos
    from bookings b
    where b.is_seed = true and b.status = 'accepted'
  )
  select
    j.job_type,
    j.area,
    tp.first_name as tukang,
    -- Recency: spread jobs across the last ~13 days by position, shifted a
    -- little each day so the exact numbers drift. Always 0..13.
    ((j.pos + (select day_offset from rot)) % 14) as days_ago
  from seed_jobs j
  cross join rot
  join tukang_pool tp
    on tp.idx = ((j.pos + (select day_offset from rot)) % (select n from tukang_pool limit 1))
  order by days_ago asc
  limit 8;
$$;

grant execute on function public.recent_activity() to authenticated;

-- Verify: rows should show rotated names + computed days_ago, ordered recent-first
select * from public.recent_activity();