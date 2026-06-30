-- ============================================================
-- TUKANG KITA — SEED SCRIPT 2 of 3: the seed data
-- Inserts fictitious seed users (tukang + customers), a pool of jobs
-- across Batam, and matching job_assignments so most render as
-- "Diterima oleh [nama]" social proof. All rows tagged is_seed = true.
-- Dates are relative to now() so they sit inside the 14-day Loker window.
-- Run this ONCE (after Script 1). Safe to re-run: it clears prior seed
-- rows first, so it won't create duplicates.
-- ============================================================

-- 0) Clear any previous seed data (idempotent re-run)
delete from job_assignments where booking_id in (select id from bookings where is_seed = true);
delete from bookings where is_seed = true;
delete from users where is_seed = true;

-- 1) Seed TUKANG (the names shown as "Diterima oleh ...")
insert into users (id, name, role, phone, email, verified, is_seed) values
  ('a0000000-0000-0000-0000-000000000001', 'Andi Saputra',  'tukang', '6281100000001', 'seed-andi@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000002', 'Budi Hartono',  'tukang', '6281100000002', 'seed-budi@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000003', 'Sari Wulandari','tukang', '6281100000003', 'seed-sari@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000004', 'Dewi Lestari',  'tukang', '6281100000004', 'seed-dewi@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000005', 'Eko Prasetyo',  'tukang', '6281100000005', 'seed-eko@tukangkita.local',   true, true),
  ('a0000000-0000-0000-0000-000000000006', 'Rina Marlina',  'tukang', '6281100000006', 'seed-rina@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000007', 'Joko Santoso',  'tukang', '6281100000007', 'seed-joko@tukangkita.local',  true, true),
  ('a0000000-0000-0000-0000-000000000008', 'Tari Anggraini','tukang', '6281100000008', 'seed-tari@tukangkita.local',  true, true);

-- 2) Seed CUSTOMERS (owners of the jobs)
insert into users (id, name, role, phone, email, verified, is_seed) values
  ('c0000000-0000-0000-0000-000000000001', 'Pak Hendra',  'customer', '6281200000001', 'seed-hendra@tukangkita.local',  true, true),
  ('c0000000-0000-0000-0000-000000000002', 'Bu Siti',     'customer', '6281200000002', 'seed-siti@tukangkita.local',    true, true),
  ('c0000000-0000-0000-0000-000000000003', 'Pak Yusuf',   'customer', '6281200000003', 'seed-yusuf@tukangkita.local',   true, true),
  ('c0000000-0000-0000-0000-000000000004', 'Bu Lina',     'customer', '6281200000004', 'seed-lina@tukangkita.local',    true, true),
  ('c0000000-0000-0000-0000-000000000005', 'Pak Rudi',    'customer', '6281200000005', 'seed-rudi@tukangkita.local',    true, true),
  ('c0000000-0000-0000-0000-000000000006', 'Bu Maya',     'customer', '6281200000006', 'seed-maya@tukangkita.local',    true, true);

-- 3) Seed JOBS. status 'accepted' = taken/full (social proof);
--    status 'available' = still open (so the feed isn't 100% closed).
--    Dates relative to now() keep them inside the 14-day window.
insert into bookings
  (id, customer_id, job_type, address, date_needed, description, status, tukang_needed, created_at, is_seed) values
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Listrik',      'Batam Centre, Komplek Taman Raya Blok C',        (now() + interval '2 days')::date, 'Pasang lampu dan perbaiki saklar',          'accepted',  1, now() - interval '1 day',  true),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Pasang AC',    'Nagoya, Apartemen Harbour Bay Tower A',          (now() + interval '1 day')::date, 'Pasang AC baru 1 PK di kamar tidur',        'accepted',  1, now() - interval '2 days', true),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Bersih Rumah', 'Batu Aji, Perumahan Genta 1',                    (now() - interval '1 day')::date, 'Bersih rumah menyeluruh 3 kamar',           'accepted',  1, now() - interval '3 days', true),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Pipa',         'Sekupang, Komplek Mediterania',                  (now() - interval '2 days')::date, 'Perbaiki kebocoran pipa di dapur',          'accepted',  1, now() - interval '4 days', true),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Cat',          'Tiban, Perumahan Tiban Indah',                   (now() - interval '1 day')::date, 'Cat ulang ruang tamu dan kamar',            'accepted',  1, now() - interval '5 days', true),
  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'Renovasi',     'Bengkong, Komplek Permata Hijau',                (now() - interval '3 days')::date, 'Renovasi kamar mandi kecil',                'accepted',  1, now() - interval '6 days', true),
  ('b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001', 'Tukang Kayu',  'Batam Centre, Ruko Mahkota Raya',                (now() - interval '2 days')::date, 'Buat rak kayu custom di gudang',            'accepted',  1, now() - interval '7 days', true),
  ('b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000002', 'Listrik',      'Nagoya, Komplek Sumber Agung',                   (now() - interval '4 days')::date, 'Tambah titik stop kontak di ruang kerja',   'accepted',  1, now() - interval '8 days', true),
  ('b0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'Bersih Rumah', 'Batu Aji, Perumahan Buana Impian 2',              (now() - interval '5 days')::date, 'Bersih setelah pindahan rumah',             'accepted',  1, now() - interval '9 days', true),
  ('b0000000-0000-0000-0000-00000000000a', 'c0000000-0000-0000-0000-000000000004', 'Pasang AC',    'Sekupang, Komplek Tiban Koperasi',               (now() - interval '4 days')::date, 'Servis dan cuci AC 2 unit',                 'accepted',  1, now() - interval '10 days', true),
  ('b0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-000000000005', 'Pipa',         'Tiban, Komplek Tiban Mas Asri',                  (now() - interval '6 days')::date, 'Ganti kran dan pipa wastafel',              'accepted',  1, now() - interval '11 days', true),
  ('b0000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000006', 'Renovasi',     'Bengkong, Komplek Indah Lestari',                (now() - interval '7 days')::date, 'Pasang plafon gypsum ruang keluarga',       'accepted',  1, now() - interval '12 days', true),
  ('b0000000-0000-0000-0000-00000000000d', 'c0000000-0000-0000-0000-000000000001', 'Cat',          'Batam Centre, Perumahan Anggrek Mas',            (now() - interval '6 days')::date, 'Cat pagar dan tembok depan rumah',          'accepted',  1, now() - interval '13 days', true),
  -- a couple still OPEN (not taken) so the feed shows live opportunities too:
  ('b0000000-0000-0000-0000-00000000000e', 'c0000000-0000-0000-0000-000000000002', 'Tukang Kayu',  'Nagoya, Komplek Bukit Indah',                    (now() + interval '4 days')::date, 'Perbaiki pintu lemari yang lepas',          'available', 1, now() - interval '1 day',  true),
  ('b0000000-0000-0000-0000-00000000000f', 'c0000000-0000-0000-0000-000000000003', 'Listrik',      'Batu Aji, Perumahan Taman Lestari',              (now() + interval '3 days')::date, 'Cek instalasi listrik yang sering jeglek',  'available', 1, now() - interval '2 days', true),
  ('b0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000004', 'Bersih Rumah', 'Sekupang, Komplek Sakura Anpan',                  (now() + interval '5 days')::date, 'Bersih rumah rutin mingguan',               'available', 1, now() - interval '3 days', true);

-- 4) Assignments: link each 'accepted' job to a seed tukang.
--    (The two 'available' jobs get no assignment — they stay open.)
insert into job_assignments (booking_id, tukang_id, sequence, accepted_at) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1, now() - interval '20 hours'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 1, now() - interval '1 day'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 1, now() - interval '2 days'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 1, now() - interval '3 days'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 1, now() - interval '4 days'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 1, now() - interval '5 days'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 1, now() - interval '6 days'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 1, now() - interval '7 days'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 1, now() - interval '8 days'),
  ('b0000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000002', 1, now() - interval '9 days'),
  ('b0000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-000000000003', 1, now() - interval '10 days'),
  ('b0000000-0000-0000-0000-00000000000c', 'a0000000-0000-0000-0000-000000000004', 1, now() - interval '11 days'),
  ('b0000000-0000-0000-0000-00000000000d', 'a0000000-0000-0000-0000-000000000005', 1, now() - interval '12 days');

-- 5) Verify
select
  (select count(*) from users    where is_seed) as seed_users,
  (select count(*) from bookings where is_seed) as seed_jobs,
  (select count(*) from job_assignments where booking_id in (select id from bookings where is_seed)) as seed_assignments;