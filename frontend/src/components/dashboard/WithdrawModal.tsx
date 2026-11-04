"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { api } from "@/lib/api";
import { formatUsd } from "@/lib/format";

interface WithdrawModalProps {
  balanceCents: number;
  /** Called with the new balance once the request is submitted. */
  onRequested: (balanceCents: number) => void;
  onClose: () => void;
}

/** Asks the admin to pay out part of the member's balance. Can't exceed the displayed balance. */
export function WithdrawModal({ balanceCents, onRequested, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const amountId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const formatOk = /^\d{1,9}(\.\d{1,2})?$/.test(amount) && Number(amount) > 0;
  const cents = formatOk ? Math.round(Number(amount) * 100) : 0;
  const tooMuch = formatOk && cents > balanceCents;
  const canSubmit = formatOk && !tooMuch && !busy && !done;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ balanceCents: number }>("/withdrawals", { method: "POST", body: { amount } });
      onRequested(res.balanceCents);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your request.");
      setBusy(false);
    }
  }

  const hint = tooMuch
    ? "That's more than your balance."
    : amount && !formatOk
      ? "Enter a valid amount, e.g. 25.00."
      : "Up to 2 decimal places.";

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/70 backdrop-blur-sm [animation:fadeIn_.2s_ease]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Withdraw funds"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-vault-card border border-vault-border rounded-t-2xl sm:rounded-2xl pt-6 px-5 pb-6 sm:px-7 sm:pb-7 max-w-[440px] w-full max-h-[92dvh] overflow-y-auto [animation:slideUp_.32s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white">Withdraw</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-black/20 border border-vault-border rounded-xl px-4 py-3 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold">Available balance</div>
          <div className="text-2xl font-black text-white tracking-tight">{formatUsd(balanceCents)}</div>
        </div>

        {done ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-4 text-[13px] text-emerald-400 leading-relaxed">
            Withdrawal requested. An administrator will review and fulfil it. The amount has been set aside from your balance.
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label htmlFor={amountId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <input
                  id={amountId}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.trim());
                    setError(null);
                  }}
                  inputMode="decimal"
                  autoComplete="off"
                  autoFocus
                  placeholder="0.00"
                  className="w-full bg-[#0e0e14] border border-vault-border rounded-xl pl-8 pr-4 py-3 text-base text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40 transition-all"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3 text-[12px]">
                <span className={tooMuch || (amount && !formatOk) ? "text-red-400" : "text-zinc-600"}>{hint}</span>
                {balanceCents > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount((balanceCents / 100).toFixed(2))}
                    className="font-semibold text-vault-accent hover:text-vault-accent/80 transition-colors"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            {error && <div className="text-[13px] text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-sm px-4 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {busy && <LoaderCircle size={16} className="animate-spin" />}
              {busy ? "Submitting…" : "Withdraw"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
