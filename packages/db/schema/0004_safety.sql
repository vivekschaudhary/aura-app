-- 0004_safety.sql
-- crisis_flags + escalation_events. Both IMMUTABLE per § Foundational Data Model
-- § Delete posture — required for safety review and regulatory evidence.
-- Even on DPDPA erasure, the FLAG FACT + ESCALATION ACTION are retained anonymously;
-- only the underlying conversation content (joined via conversation_id) is purged.

create table crisis_flags (
  id                  uuid primary key default uuidv7(),
  conversation_id     uuid not null references conversations(id) on delete set null,
  classifier_version  text not null,
  indicator_type      text not null,                      -- e.g. 'self_harm', 'abuse'
  confidence          numeric(4,3) not null,              -- 0.000–1.000
  detected_at         timestamptz not null default now()  -- immutable
);

create index crisis_flags_conversation_id_idx on crisis_flags (conversation_id);
create index crisis_flags_detected_at_idx on crisis_flags (detected_at desc);
alter table crisis_flags enable row level security;
-- Immutability enforced by triggers in feature bet (block UPDATE/DELETE except cascading conversation_id null).

create table escalation_events (
  id                uuid primary key default uuidv7(),
  crisis_flag_id    uuid not null references crisis_flags(id) on delete cascade,
  action            text not null,                          -- 'tele_manas_card', 'helpline_call', etc.
  user_acknowledged boolean not null default false,
  created_at        timestamptz not null default now()      -- immutable
);

create index escalation_events_crisis_flag_id_idx on escalation_events (crisis_flag_id);
alter table escalation_events enable row level security;
