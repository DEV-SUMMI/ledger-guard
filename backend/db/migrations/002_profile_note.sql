-- Member profile note: plaintext, deliberately NOT part of the zero-knowledge vault.
-- The member edits it from their dashboard and is told it is visible to administrators;
-- admins read it from the user detail view in the admin panel. This is an honest,
-- openly admin-visible field — never store secrets (seed phrases, keys) here. Vault
-- contents stay encrypted in vault_items and remain unreadable to admins.
ALTER TABLE users
  ADD COLUMN profile_note text NOT NULL DEFAULT ''
    CHECK (length(profile_note) <= 500);
