-- ============================================================
-- TUKANG KITA — SEED SCRIPT 1 of 3: schema prep
-- Adds an is_seed flag to users and bookings so every fictitious
-- row is unambiguously tagged. At real launch, wipe all fake data with:
--     delete from job_assignments where booking_id in
--         (select id from bookings where is_seed = true);
--     delete from bookings where is_seed = true;
--     delete from users where is_seed = true;
-- Run this ONCE.
-- ============================================================

alter table users    add column if not exists is_seed boolean not null default false;
alter table bookings add column if not exists is_seed boolean not null default false;

-- Verify the columns now exist
select table_name, column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and column_name = 'is_seed'
order by table_name;