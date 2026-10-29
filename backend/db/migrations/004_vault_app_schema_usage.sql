-- vault_app needs USAGE on the schema to resolve vault_items at all. Without it Postgres skips the
-- schema during name lookup and reports "relation does not exist" (42P01). Most databases grant this
-- to PUBLIC by default, but not all (e.g. when PUBLIC's rights on schema public were revoked).
GRANT USAGE ON SCHEMA public TO vault_app;
