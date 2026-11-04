import { ArrowUpRight, Wallet } from "lucide-react";
import { formatUsd } from "@/lib/format";

interface BalanceCardProps {
  balanceCents: number | null;
  error?: boolean;
  onWithdraw: () => void;
}

/** The member's dollar balance. Only an admin can change it; members can request a withdrawal. */
export function BalanceCard({ balanceCents, error, onWithdraw }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-vault-accent/10 to-vault-blue/5 border border-vault-accent/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-vault-accent shrink-0 hidden sm:block">
          <Wallet size={28} strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <div className="text-xs text-zinc-500 font-medium mb-1.5">Account balance</div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight truncate">
            {error ? "—" : balanceCents === null ? "…" : formatUsd(balanceCents)}
          </div>
          <p className="text-[12px] text-vault-textMuted mt-1.5">
            {error ? "Couldn't load your balance." : "Updated by your account administrator."}
          </p>
        </div>
      </div>
      <button
        onClick={onWithdraw}
        disabled={balanceCents === null || balanceCents <= 0}
        className="flex items-center justify-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-sm px-5 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 w-full sm:w-auto shrink-0"
      >
        <ArrowUpRight size={16} />
        Withdraw
      </button>
    </div>
  );
}
