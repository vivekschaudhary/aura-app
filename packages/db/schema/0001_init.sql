-- 0001_init.sql
-- Foundational tables: users, passkey_credentials, audit_log.
-- Conventions encoded here per docs/foundation/architecture.md § Foundational Data Model:
--   * UUID v7 ids (via pg_uuidv7 extension)
--   * timestamptz UTC; created_at / updated_at / deleted_at
--   * RLS enabled on all user-owned tables (policies tightened in feature bets)
--   * audit_log immutable (no UPDATE / DELETE policy)

create extension if not exists "pg_uuidv7";   -- provides uuidv7() — required for ids
create extension if not exists "pgcrypto";    -- for hashing helpers
create extension if not exists "citext";      -- case-insensitive handle uniqueness

-- Helper: per-request user scoping for RLS policies (used by packages/db/src/client.ts).
create or replace function set_request_user(user_id uuid)
returns void as $$
  select set_config('request.user_id', user_id::text, true);
$$ language sql security definer;

-- Language enum — v1 launch set; expanded additively in 0006_languages.sql.
create type language_v1 as enum ('en', 'hi');

-- ──────────────────────────────────────────────────────────────────────────────
-- users
-- Traces to: product.md v2 Vision + Personas. Handle is a display identifier
-- (not a credential — see § Foundational Data Model). Passkey is the credential.
-- ──────────────────────────────────────────────────────────────────────────────
create table users (
  id               uuid primary key default uuidv7(),
  handle           citext unique not null,                       -- case-insensitive
  primary_language language_v1 not null default 'en',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz                                   -- soft delete (30-day restore window)
);

alter table users enable row level security;
-- policies: see feature bet (per-user via request.user_id setting; service role bypasses)

-- @pii handle is low-sensitivity; updated_at trigger added in feature bet.

-- ──────────────────────────────────────────────────────────────────────────────
-- passkey_credentials
-- Multiple per user (one per enrolled device). Hard-delete on device removal —
-- no value in soft-deleting a credential per § Foundational Data Model § Delete posture.
-- ──────────────────────────────────────────────────────────────────────────────
create table passkey_credentials (
  id            uuid primary key default uuidv7(),
  user_id       uuid not null references users(id) on delete cascade,
  public_key    bytea not null,
  counter       bigint not null default 0,
  aaguid        text,                                            -- authenticator model
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz not null default now()
);

create index passkey_credentials_user_id_idx on passkey_credentials (user_id);
alter table passkey_credentials enable row level security;

-- ──────────────────────────────────────────────────────────────────────────────
-- audit_log
-- IMMUTABLE — no UPDATE / DELETE allowed. Captures safety + compliance events:
--   crisis.flag_raised, crisis.escalation_triggered,
--   user.erasure_requested, user.erasure_completed,
--   prompt.version_changed, key.rotated
-- ──────────────────────────────────────────────────────────────────────────────
create table audit_log (
  id             uuid primary key default uuidv7(),
  event_type     text not null,
  actor_user_id  uuid references users(id) on delete set null,    -- nullable for system events
  entity_type    text not null,
  entity_id      uuid not null,
  metadata       jsonb not null default '{}'::jsonb,
  occurred_at    timestamptz not null default now()                -- immutable
);

create index audit_log_event_type_idx     on audit_log (event_type, occurred_at desc);
create index audit_log_actor_user_id_idx  on audit_log (actor_user_id, occurred_at desc);
create index audit_log_entity_idx         on audit_log (entity_type, entity_id);

alter table audit_log enable row level security;
-- Immutability enforced by triggers in feature bet (block UPDATE/DELETE).
