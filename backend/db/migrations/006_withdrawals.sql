-- Withdrawal requests. The amount is held (deducted from users.balance_cents) when the member
-- asks, so several requests can never add up to more than the balance. An admin then marks the
-- request fulfilled (the hold becomes final) or rejected (the amount is returned to the balance).
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'rejected')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz,
  resolved_by  uuid REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS withdrawal_requests_status_idx ON withdrawal_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS withdrawal_requests_user_idx ON withdrawal_requests (user_id, created_at DESC);
