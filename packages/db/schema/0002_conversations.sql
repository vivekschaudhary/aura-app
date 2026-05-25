-- 0002_conversations.sql
-- Conversations (persistent topical threads) + Turns (single exchanges).
-- See § Foundational Data Model — Conversation is the sidebar item, accumulating
-- Turns over multiple sittings. "Session" is computed from turn-timestamp gaps,
-- not stored.

create table conversations (
  id              uuid primary key default uuidv7(),
  user_id         uuid not null references users(id) on delete cascade,
  title           text not null default 'New conversation',  -- auto-summarised after ~3 turns; user-editable
  language        language_v1 not null,
  started_at      timestamptz not null default now(),
  last_active_at  timestamptz not null default now(),         -- sidebar sort order
  ended_at        timestamptz,                                -- nullable; user-explicit end
  deleted_at      timestamptz                                 -- soft delete (30-day restore)
);

-- Sidebar query: most-recent first per user.
create index conversations_user_active_idx
  on conversations (user_id, last_active_at desc)
  where deleted_at is null;

alter table conversations enable row level security;

-- ──────────────────────────────────────────────────────────────────────────────
-- turns
-- Append-only in practice (no UPDATE in app code). Content is @pii — encrypted
-- at rest by Supabase, never logged per § Cross-cutting standards § Logging.
-- ──────────────────────────────────────────────────────────────────────────────
create type turn_role as enum ('user', 'assistant');

create table turns (
  id              uuid primary key default uuidv7(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            turn_role not null,
  content         text not null,                              -- @pii (encrypted at rest)
  model           text,                                       -- null for user turns
  tokens_in       int not null default 0,
  tokens_out      int not null default 0,
  cost_inr        numeric(10,4) not null default 0,           -- rolls up to cost/WAR dashboard
  latency_ms      int not null default 0,
  created_at      timestamptz not null default now()
);

-- Hot path: load a conversation's turns in order.
create index turns_conversation_id_created_at_idx
  on turns (conversation_id, created_at);

-- WAR / Reflection-Session computation: turn timestamps per user (gap-clustering).
create index turns_conversation_created_at_idx
  on turns (conversation_id, created_at desc);

alter table turns enable row level security;
