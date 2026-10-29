"use client";

import { Download, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AuditLog } from "@/components/admin/AuditLog";
import { MetricCards } from "@/components/admin/MetricCards";
import { UserDetailPanel } from "@/components/admin/UserDetailPanel";
import { UsersTable } from "@/components/admin/UsersTable";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AdminMetrics, AdminTab, AdminUser, AdminUserDetail, AuditEvent } from "@/types/admin";

const TABS: { key: AdminTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "audit", label: "Audit log" },
];

const TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "System health and growth at a glance." },
  users: { title: "Users", subtitle: "Manage accounts and access." },
  audit: { title: "Audit log", subtitle: "Security-relevant events across the platform." },
};

interface AdminData {
  metrics: AdminMetrics;
  users: AdminUser[];
  events: AuditEvent[];
}

async function fetchAdminData(): Promise<AdminData> {
  const [metrics, { users }, { events }] = await Promise.all([
    api<AdminMetrics>("/admin/metrics"),
    api<{ users: AdminUser[] }>("/admin/users"),
    api<{ events: AuditEvent[] }>("/admin/audit"),
  ]);
  return { metrics, users, events };
}

function csvCell(value: unknown) {
  const s = String(value ?? "");
  // Quote everything, and defuse spreadsheet formulas in user-supplied text.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

function downloadUsersCsv(users: AdminUser[]) {
  const header = ["name", "email", "role", "status", "items", "createdAt", "lastActiveAt"] as const;
  const lines = [header.join(","), ...users.map((u) => header.map((k) => csvCell(u[k])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "users.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminShell({ adminId }: { adminId: string }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const { title, subtitle } = TITLES[tab];

  const openDetail = useCallback(async (user: AdminUser) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const { user: full } = await api<{ user: AdminUserDetail }>(`/admin/users/${user.id}`);
      setDetail(full);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Couldn't load this profile.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAdminData());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAdminData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load admin data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex">
      <AdminSidebar active={tab} onSelect={setTab} />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-vault-bg/80 backdrop-blur-xl border-b border-vault-border px-5 sm:px-8 py-4">
          {/* Mobile tab switcher */}
          <div className="lg:hidden flex gap-1 bg-black/20 rounded-lg p-1 mb-1 w-full overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 whitespace-nowrap px-3 py-1.5 rounded-md text-[12px] font-bold transition-all",
                  tab === t.key ? "bg-vault-accent/15 text-vault-accent" : "text-zinc-500",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
              <p className="text-[13px] text-vault-textMuted mt-0.5 hidden sm:block">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={loading}
                aria-label="Refresh"
                className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] transition-all disabled:opacity-50"
              >
                <RefreshCw size={15} className={cn(loading && "animate-spin")} />
              </button>
              <button
                onClick={() => data && downloadUsersCsv(data.users)}
                disabled={!data}
                className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-semibold text-[13px] px-3.5 py-2 rounded-xl hover:bg-white/[0.08] transition-all disabled:opacity-50"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Export users</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-5 sm:px-8 py-6 sm:py-8 max-w-[1140px] w-full mx-auto">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-red-400 text-sm">{error}</div>
          )}
          {!data ? (
            !error && <div className="bg-vault-card border border-vault-border rounded-2xl p-12 text-center text-vault-textMuted text-sm">Loading…</div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="flex flex-col gap-8">
                  <MetricCards metrics={data.metrics} />
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white">Recent activity</h2>
                      <button onClick={() => setTab("audit")} className="text-[13px] font-semibold text-vault-accent hover:text-vault-accent/80 transition-colors">
                        View all
                      </button>
                    </div>
                    <AuditLog events={data.events.slice(0, 7)} />
                  </section>
                </div>
              )}
              {tab === "users" && <UsersTable users={data.users} adminId={adminId} onChanged={refresh} onSelect={openDetail} />}
              {tab === "audit" && <AuditLog events={data.events} />}
            </>
          )}
        </div>
      </main>

      {detailOpen && (
        <UserDetailPanel user={detail} loading={detailLoading} error={detailError} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}
