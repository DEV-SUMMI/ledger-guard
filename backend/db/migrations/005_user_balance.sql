-- Dollar balance shown on the member dashboard. Only admins change it (via the audited
-- /api/admin/users/:id/balance route). Stored in cents to avoid floating-point drift.
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0);
