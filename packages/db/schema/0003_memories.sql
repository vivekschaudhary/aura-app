-- 0003_memories.sql
-- Memory layer — THE MOAT per docs/foundation/product.md v2 § Defensibility (primary moat #1).
-- Postgres + pgvector with HNSW index. Performance fitness function: P95 recall ≤ 1.5s.

create extension if not exists "vector";  -- pgvector

create table memories (
  id          uuid primary key default uuidv7(),
  user_id     uuid not null references users(id) on delete cascade,
  content     text not null,                            -- @pii (encrypted at rest)
  embedding   vector(1536) not null,                    -- OpenAI text-embedding-3-small dim
  topic       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz                               -- soft delete (30-day restore)
);

-- HNSW index for ANN recall. Per architecture R-MEMORY: monitor index-RAM ratio.
-- m=16, ef_construction=64 are pgvector defaults; tune at scale.
create index memories_embedding_hnsw_idx
  on memories
  using hnsw (embedding vector_cosine_ops);

-- User-scoped scans (e.g., list all of a user's memories).
create index memories_user_id_created_at_idx
  on memories (user_id, created_at desc)
  where deleted_at is null;

alter table memories enable row level security;
