"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { loadMemberVault } from "@/lib/admin-vault";
import type { Vault } from "@/lib/vault-client";

function Secret({ label, hint, value }: { label: string; hint?: string; value: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="rounded-xl border border-vault-border bg-[#0e0e14] px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-zinc-200 font-medium truncate">{label}</div>
          {hint && <div className="text-[11px] text-zinc-600 truncate">{hint}</div>}
        </div>
        <button
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide secret" : "Reveal secret"}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          {shown ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <div className="mt-2 font-mono text-[12px] break-all text-zinc-400">{shown ? value : "•".repeat(Math.min(value.length, 32))}</div>
    </div>
  );
}

/** Decrypts a member's vault in this browser via admin key escrow. Each load is audited server-side. */
export function MemberVault({ userId }: { userId: string }) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decrypt() {
    setBusy(true);
    setError(null);
    try {
      setVault(await loadMemberVault(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't decrypt this vault.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
        <KeyRound size={13} className="text-vault-accent/70" />
        Vault contents <span className="normal-case tracking-normal font-normal">(admin escrow, audited)</span>
      </div>

      {!vault && (
        <button
          onClick={decrypt}
          disabled={busy}
          className="w-full rounded-xl border border-vault-border bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {busy ? "Decrypting…" : "Decrypt vault"}
        </button>
      )}
      {error && <div className="mt-2 text-[13px] text-red-400">{error}</div>}

      {vault && (
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto">
          {vault.seeds.map((s) => (
            <Secret key={s.id} label={`Seed phrase · ${s.walletId}`} value={s.words.join(" ")} />
          ))}
          {vault.keys.map((k) => (
            <Secret key={k.id} label={k.title} hint={`${k.category} · ${k.hint}`} value={k.secret} />
          ))}
          {vault.seeds.length + vault.keys.length === 0 && (
            <div className="text-[13px] text-vault-textFaint italic">No items in this vault.</div>
          )}
          {vault.unreadable > 0 && (
            <div className="text-[12px] text-amber-400">{vault.unreadable} item(s) failed to decrypt.</div>
          )}
        </div>
      )}
    </div>
  );
}
