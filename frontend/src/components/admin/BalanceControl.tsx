"use client";

import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { formatUsd } from "@/lib/format";

/** Shows a member's dollar balance and lets the admin increase or decrease it. */
export function BalanceControl({ userId, initialCents }: { userId: string; initialCents: number }) {
  const [cents, setCents] = useState(initialCents);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<"increase" | "decrease" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const valid = /^\d{1,9}(\.\d{1,2})?$/.test(amount) && Number(amount) > 0;

  async function adjust(operation: "increase" | "decrease") {
    if (!valid || busy) return;
    setBusy(operation);
    setMessage(null);
    try {
      const res = await api<{ balanceCents: number }>(`/admin/users/${userId}/balance`, {
        method: "PATCH",
        body: { operation, amount },
      });
      setCents(res.balanceCents);
      setAmount("");
      setMessage({ tone: "ok", text: `Balance ${operation === "increase" ? "increased" : "decreased"}.` });
    } catch (err) {
      setMessage({ tone: "error", text: err instanceof Error ? err.message : "Couldn't update the balance." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-black/20 border border-vault-border rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold mb-1">Balance</div>
      <div className="text-2xl font-black text-white tracking-tight mb-3">{formatUsd(cents)}</div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.trim())}
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Amount in dollars"
            className="w-full bg-[#0e0e14] border border-vault-border rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40"
          />
        </div>
        <button
          onClick={() => adjust("increase")}
          disabled={!valid || busy !== null}
          aria-label="Increase balance"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
        >
          {busy === "increase" ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
        <button
          onClick={() => adjust("decrease")}
          disabled={!valid || busy !== null}
          aria-label="Decrease balance"
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40"
        >
          {busy === "decrease" ? <LoaderCircle size={14} className="animate-spin" /> : <Minus size={14} />}
          Deduct
        </button>
      </div>
      {message && <p className={`text-[12px] mt-2 ${message.tone === "ok" ? "text-emerald-400" : "text-red-400"}`}>{message.text}</p>}
    </div>
  );
}
