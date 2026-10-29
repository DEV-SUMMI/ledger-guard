-- Digital Vault schema.
-- Vault contents are encrypted in the browser; the server only ever stores ciphertext.

-- Role used for every request that touches a member's vault. It cannot log in;
-- the app switches to it per transaction (SET LOCAL ROLE) so row-level security applies
-- even when the connection user owns the tables or is a superuser (as on Railway).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vault_app') THEN
    CREATE ROLE vault_app NOLOGIN;
  END IF;
END
$$;
GRANT vault_app TO CURRENT_USER;

CREATE TABLE users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text NOT NULL UNIQUE CHECK (email = lower(email) AND length(email) <= 254),
  name                text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  role                text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status              text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  -- scrypt hash of the auth key the browser derives from the password (never the password itself)
  auth_hash           text NOT NULL,
  -- Key-derivation parameters the browser needs to re-derive keys at sign-in
  kdf_salt            text NOT NULL,
  kdf_iterations      integer NOT NULL CHECK (kdf_iterations >= 600000),
  -- The member's vault key, encrypted with a key only their password can produce
  protected_vault_key text NOT NULL,
  failed_logins       integer NOT NULL DEFAULT 0,
  locked_until        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  last_active_at      timestamptz
);

CREATE TABLE sessions (
  -- SHA-256 of the session token; the raw token only exists in the member's cookie
  id           text PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  ip           text,
  user_agent   text
);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE vault_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category   text NOT NULL CHECK (category IN ('seed', 'privatekey', 'apikey')),
  -- Which wallet a seed phrase belongs to (e.g. 'metamask'); null for other categories
  wallet_id  text CHECK (wallet_id ~ '^[a-z0-9-]{1,40}$'),
  -- AES-256-GCM payload produced in the browser: v1.<iv>.<ciphertext>
  ciphertext text NOT NULL CHECK (length(ciphertext) <= 20000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vault_items_owner_idx ON vault_items (owner_id, updated_at DESC);
-- One seed phrase per wallet per member, matching the wallet grid
CREATE UNIQUE INDEX vault_items_seed_wallet_idx ON vault_items (owner_id, wallet_id) WHERE category = 'seed';

ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_items_owner ON vault_items
  USING (owner_id = nullif(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = nullif(current_setting('app.user_id', true), '')::uuid);
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_items TO vault_app;

CREATE TABLE audit_events (
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES users (id) ON DELETE SET NULL,
  actor_email text,
  level       text NOT NULL CHECK (level IN ('info', 'warning', 'critical')),
  event       text NOT NULL,
  detail      text,
  ip          text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_created_idx ON audit_events (created_at DESC);
CREATE INDEX audit_events_user_idx ON audit_events (user_id, created_at DESC);
