"use client";

import { ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import { BalanceControl } from "@/components/admin/BalanceControl";
import { MemberVault } from "@/components/admin/MemberVault";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUserDetail } from "@/types/admin";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-zinc-600 font-semibold mb-1">{label}</div>
      <div className="text-[13px] text-zinc-300">{value}</div>
    </div>
  );
}

interface UserDetailPanelProps {
  /** The fetched detail, or null while loading. */
  user: AdminUserDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function UserDetailPanel({ user, loading, error, onClose }: UserDetailPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/70 backdrop-blur-sm [animation:fadeIn_.2s_ease]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User profile"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-vault-card border border-vault-border rounded-t-2xl sm:rounded-2xl pt-6 px-5 pb-5 sm:px-7 sm:pb-7 max-w-[480px] w-full [animation:slideUp_.32s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white">User profile</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {loading && <div className="py-10 text-center text-sm text-vault-textMuted">Loading…</div>}
        {error && <div className="py-4 text-[13px] text-red-400">{error}</div>}

        {user && (
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vault-accent/25 to-vault-blue/15 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-[12px] text-zinc-500 truncate">{user.email}</div>
              </div>
              <div className="ml-auto">
                <StatusBadge status={user.status} />
              </div>
            </div>

            {/* Account facts */}
            <div className="grid grid-cols-2 gap-4 bg-black/20 border border-vault-border rounded-xl p-4">
              <Field label="Role" value={user.role} />
              <Field label="Vault items" value={String(user.items)} />
              <Field label="Joined" value={timeAgo(user.createdAt)} />
              <Field label="Last active" value={timeAgo(user.lastActiveAt)} />
            </div>

            <BalanceControl key={user.id} userId={user.id} initialCents={user.balanceCents} />

            {/* Profile note — the openly admin-visible, member-written field */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-600 font-semibold mb-1.5">
                <ShieldCheck size={13} className="text-vault-accent/70" />
                Profile note <span className="normal-case tracking-normal text-zinc-600 font-normal">(member-written, admin-visible)</span>
              </div>
              <div
                className={cn(
                  "min-h-[64px] whitespace-pre-wrap break-words text-[13px] rounded-xl border border-vault-border bg-[#0e0e14] px-4 py-3",
                  user.profileNote ? "text-zinc-200" : "text-vault-textFaint italic",
                )}
              >
                {user.profileNote || "No note set."}
              </div>
            </div>

            <MemberVault key={user.id} userId={user.id} />

            <p className="text-[12px] text-vault-textMuted leading-relaxed">
              Demo build with admin key escrow: each member&apos;s vault key is also wrapped to the admin&apos;s public key.
              Decryption happens in your browser and every read is recorded in the audit log.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
