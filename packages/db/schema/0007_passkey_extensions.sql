-- 0007_passkey_extensions.sql
-- AUR-5 PR 2 — fills two gaps in 0001's passkey_credentials table that surface
-- the moment the real @simplewebauthn ceremony lands:
--   1. credential_id (the WebAuthn-native identifier) is required to look up a
--      credential during an assertion (returning-user sign-in) AND to populate
--      `excludeCredentials` on subsequent enrollments. 0001 stored only an
--      internal uuidv7() PK, which can't be derived from the wire payload.
--   2. aaguid is reported by every authenticator (zero-UUID for anonymous
--      authenticators), so `not null` matches the truth on the wire and
--      matches the @aura/core PasskeyCredential type (`aaguid: string`).
--
-- Safe to apply on an empty table (no Supabase project exists yet — OPS-001
-- pending). When OPS-001 lands and migrations run for the first time, this
-- ships together with 0001..0006.

alter table passkey_credentials
  add column credential_id bytea not null;

create unique index passkey_credentials_credential_id_uniq
  on passkey_credentials (credential_id);

alter table passkey_credentials
  alter column aaguid set not null;
