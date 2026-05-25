-- 0005_ratings.sql
-- Ratings (clarity + NPS) and ClarityMoments.
-- Traces to product.md v2 Objective 1 KR3 (≥1,000 post-session ratings) +
-- Objective 2 KR1 (NPS ≥ 40) + north-star metric ("saved 'clarity moment'").

create type rating_type as enum ('clarity', 'nps');

create table ratings (
  id              uuid primary key default uuidv7(),
  user_id         uuid not null references users(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,  -- nullable for NPS
  type            rating_type not null,
  score           int not null check (score between 1 and 10),
  comment         text,                                                   -- @pii (nullable)
  created_at      timestamptz not null default now()
);

create index ratings_user_id_idx on ratings (user_id, created_at desc);
create index ratings_type_idx on ratings (type, created_at desc);
alter table ratings enable row level security;

-- ──────────────────────────────────────────────────────────────────────────────
-- clarity_moments
-- A WAR-qualifying signal: a Reflection Session is one that (≥3 turns AND ended
-- explicitly) OR (produced a saved ClarityMoment).
-- ──────────────────────────────────────────────────────────────────────────────
create table clarity_moments (
  id              uuid primary key default uuidv7(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  note            text not null,                                          -- @pii
  created_at      timestamptz not null default now()
);

create index clarity_moments_user_id_idx on clarity_moments (user_id, created_at desc);
create index clarity_moments_conversation_id_idx on clarity_moments (conversation_id);
alter table clarity_moments enable row level security;
