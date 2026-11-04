"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatUsd, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminWithdrawal, WithdrawalStatus } from "@/types/admin";

const STATUS_STYLE: Record<WithdrawalStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  fulfilled: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

/** Members' withdrawal requests. Fulfilling keeps the held amount; rejecting returns it to the member. */
export function WithdrawalsPanel() {
  const [rows, setRows] = useState<AdminWithdrawal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { withdrawals } = await api<{ withdrawals: AdminWithdrawal[] }>("/admin/withdrawals");
      setRows(withdrawals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load withdrawal requests.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, [load]);

  async function resolve(id: string, status: "fulfilled" | "rejected") {
    setBusyId(id);
    try {
      await api(`/admin/withdrawals/${id}`, { method: "PATCH", body: { status } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this request.");
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) {
    return error ? (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-red-400 text-sm">{error}</div>
    ) : (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-12 text-center text-vault-textMuted text-sm">Loading…</div>
    );
  }

  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-red-400 text-sm">{error}</div>}
      <p className="text-[13px] text-vault-textMuted">
        {pending === 0 ? "No pending requests." : `${pending} pending request${pending === 1 ? "" : "s"}.`} Rejecting a request returns the
        amount to the member&apos;s balance.
      </p>

      {rows.length === 0 ? (
        <div className="bg-vault-card border border-vault-border rounded-2xl p-10 text-center text-sm text-vault-textMuted">
          No withdrawal requests yet.
        </div>
      ) : (
        <div className="bg-vault-card border border-vault-border rounded-2xl divide-y divide-vault-border/60">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white">{formatUsd(r.amountCents)}</span>
                  <span className={cn("text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md", STATUS_STYLE[r.status])}>
                    {r.status}
                  </span>
                </div>
                <div className="text-[13px] text-zinc-300 truncate mt-0.5">{r.name}</div>
                <div className="text-[12px] text-zinc-500 truncate">{r.email}</div>
                <div title={new Date(r.createdAt).toLocaleString()} className="text-[11px] text-zinc-600 mt-1">
                  Requested {timeAgo(r.createdAt)}
                </div>
              </div>

              {r.status === "pending" && (
                <div className="flex gap-2 sm:shrink-0">
                  <button
                    onClick={() => resolve(r.id, "fulfilled")}
                    disabled={busyId !== null}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors disabled:opacity-40"
                  >
                    {busyId === r.id ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                    Fulfil
                  </button>
                  <button
                    onClick={() => resolve(r.id, "rejected")}
                    disabled={busyId !== null}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
