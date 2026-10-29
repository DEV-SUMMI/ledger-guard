"use client";

import { Lock } from "lucide-react";
import { useId, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { unlockVault } from "@/lib/auth-client";
import type { SessionUser } from "@/types/auth";

/** Shown when the session is valid but the vault key isn't in memory (e.g. after a reload). */
export function UnlockVault({ user, onUnlock }: { user: SessionUser; onUnlock: (key: CryptoKey) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordId = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      const key = await unlockVault(password);
      setPassword("");
      onUnlock(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't unlock the vault.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-[380px] bg-vault-card border border-vault-border rounded-2xl p-7 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-xl bg-vault-accent/10 flex items-center justify-center text-vault-accent">
          <Lock size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Vault locked</h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Enter your password to unlock {user.email}. It never leaves this device.
          </p>
        </div>

        <div>
          <label htmlFor={passwordId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
            Password
          </label>
          <input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0e0e14] border border-vault-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-vault-accent/40 transition-all"
          />
          {error && <p className="text-[12px] text-red-400 mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={busy || !password}
          className="w-full bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold py-3 rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40"
        >
          {busy ? "Unlocking…" : "Unlock"}
        </button>
        <SignOutButton className="self-center" />
      </form>
    </div>
  );
}
