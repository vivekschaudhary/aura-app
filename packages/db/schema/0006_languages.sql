-- 0006_languages.sql
-- Language enum management — additive expansion pattern for ramp languages.
-- v1 launch: 'en', 'hi' (created in 0001_init.sql as `language_v1`).
-- Ramp plan (per architecture decision 2026-05-24): add 'ta', 'te', 'bn', 'mr', 'kn'
-- one at a time after each passes the per-language quality eval (R-SPEECH).
--
-- Postgres enum values can be ADDED safely (no table rewrite); they cannot be
-- removed or reordered without rewriting dependent tables — so order doesn't matter
-- for sort, only for display. Application-layer enforces ordering.
--
-- This file is intentionally near-empty at v1 launch. Future migrations will:
--   ALTER TYPE language_v1 ADD VALUE IF NOT EXISTS 'ta';  -- etc.

-- Sanity check: confirm v1 enum exists with the two launch values.
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'language_v1' and e.enumlabel in ('en', 'hi')
    group by t.typname
    having count(*) = 2
  ) then
    raise exception 'language_v1 enum must have exactly {en, hi} at v1 launch';
  end if;
end $$;
