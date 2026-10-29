-- Admin key escrow (class project, demo data only).
-- At sign-up the browser also wraps the member's vault key to the admin's public key, so the
-- admin (and only the admin, in their own browser) can decrypt a member's vault items.

-- One row: the admin's RSA-OAEP public key (base64 SPKI), published by scripts/seed-admin.mjs.
CREATE TABLE IF NOT EXISTS admin_escrow (
  id         boolean PRIMARY KEY DEFAULT true CHECK (id),
  public_key text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Member's vault key wrapped to the admin public key (base64 RSA-OAEP). NULL = no escrow copy.
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_wrapped_vault_key text;

-- Admin only: the RSA private key (base64 PKCS8) sealed with the admin's own vault key.
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_private_key_wrapped text;
