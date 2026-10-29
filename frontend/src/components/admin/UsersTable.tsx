"use client";

import { Ban, Search, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUser, UserStatus } from "@/types/admin";

const FILTERS: { key: UserStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface UsersTableProps {
  users: AdminUser[];
  /** The signed-in admin, who can't change their own status */
  adminId: string;
  onChanged: () => Promise<void>;
  /** Open the profile detail panel for a user */
  onSelect: (user: AdminUser) => void;
}

export function UsersTable({ users, adminId, onChanged, onSelect }: UsersTableProps) {
  const [filter, setFilter] = useState<UserStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "all" && u.status !== filter) return false;
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, filter, query]);

  async function setStatus(user: AdminUser, status: UserStatus) {
    if (status === "suspended" && !window.confirm(`Suspend ${user.email}? They'll be signed out everywhere.`)) return;
    setPending(user.id);
    setError(null);
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", body: { status } });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the account.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="bg-vault-card border border-vault-border rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-vault-border">
        <div className="relative flex-1 max-w-[320px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-[#0e0e14] border border-vault-border rounded-lg pl-9 pr-3 py-2 text-[13px] text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-black/20 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[12px] font-bold transition-all",
                filter === f.key ? "bg-vault-accent/15 text-vault-accent" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="px-4 py-3 text-[13px] text-red-400 border-b border-vault-border">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-600 border-b border-vault-border">
              <th className="font-semibold px-4 py-3">User</th>
              <th className="font-semibold px-4 py-3">Role</th>
              <th className="font-semibold px-4 py-3">Status</th>
              <th className="font-semibold px-4 py-3">Items</th>
              <th className="font-semibold px-4 py-3">Last active</th>
              <th className="font-semibold px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelect(u)}
                className="border-b border-vault-border/60 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vault-accent/25 to-vault-blue/15 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{u.name}</div>
                      <div className="text-[12px] text-zinc-600 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-[12px] font-bold capitalize", u.role === "admin" ? "text-vault-accent" : "text-zinc-500")}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-zinc-400 font-mono">{u.items}</td>
                <td className="px-4 py-3 text-zinc-500 first-letter:uppercase">{timeAgo(u.lastActiveAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {u.id === adminId ? (
                      <span className="text-[11px] text-zinc-600">You</span>
                    ) : u.status === "suspended" ? (
                      <button
                        title="Reinstate"
                        aria-label={`Reinstate ${u.email}`}
                        disabled={pending !== null}
                        onClick={() => setStatus(u, "active")}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-vault-accent hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                      >
                        <UserCheck size={16} />
                      </button>
                    ) : (
                      <button
                        title="Suspend"
                        aria-label={`Suspend ${u.email}`}
                        disabled={pending !== null}
                        onClick={() => setStatus(u, "suspended")}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="px-4 py-10 text-center text-sm text-vault-textMuted">No users match.</div>}
      </div>
    </div>
  );
}
