"use client";

import { Menu, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { AddItemModal } from "@/components/dashboard/AddItemModal";
import { ProfileModal } from "@/components/dashboard/ProfileModal";
import { SeedWalletGrid } from "@/components/dashboard/SeedWalletGrid";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatRow } from "@/components/dashboard/StatRow";
import { UnlockVault } from "@/components/dashboard/UnlockVault";
import { VaultItemCard } from "@/components/dashboard/VaultItemCard";
import { api } from "@/lib/api";
import { getVaultKey } from "@/lib/vault-key";
import { loadVault, type Vault } from "@/lib/vault-client";
import { CATEGORY_LABEL } from "@/lib/vault-data";
import type { SessionUser } from "@/types/auth";
import type { CategoryId, KeyItem, SeedItem } from "@/types/vault";

export function DashboardShell({ user }: { user: SessionUser }) {
  // The key survives client-side navigation from the login page, but not a reload.
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(getVaultKey);
  const [vault, setVault] = useState<Vault | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!vaultKey) return;
    let cancelled = false;
    loadVault(vaultKey).then(
      (v) => !cancelled && setVault(v),
      (err) => !cancelled && setLoadError(err instanceof Error ? err.message : "Couldn't load your vault."),
    );
    return () => {
      cancelled = true;
    };
  }, [vaultKey]);

  useEffect(() => {
    let cancelled = false;
    api<{ balanceCents: number }>("/balance").then(
      (b) => !cancelled && setBalanceCents(b.balanceCents),
      () => !cancelled && setBalanceError(true),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const keys = useMemo(() => vault?.keys ?? [], [vault]);
  const seeds = useMemo(() => vault?.seeds ?? [], [vault]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { seed: seeds.length };
    for (const item of keys) c[item.category] = (c[item.category] ?? 0) + 1;
    return c;
  }, [keys, seeds]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return keys.filter((item) => {
      if (active !== "all" && item.category !== active) return false;
      if (q && !`${item.title} ${item.hint}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [keys, active, query]);

  if (!vaultKey) return <UnlockVault user={user} onUnlock={setVaultKey} />;

  const total = keys.length + seeds.length;
  const lastUpdated = [...keys, ...seeds].reduce<string | null>((latest, i) => (!latest || i.updatedAt > latest ? i.updatedAt : latest), null);
  const heading = active === "all" ? "All items" : CATEGORY_LABEL[active];

  const updateKeys = (fn: (cur: KeyItem[]) => KeyItem[]) => setVault((v) => v && { ...v, keys: fn(v.keys) });
  const updateSeeds = (fn: (cur: SeedItem[]) => SeedItem[]) => setVault((v) => v && { ...v, seeds: fn(v.seeds) });

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex">
      <Sidebar active={active} counts={counts} onSelect={setActive} total={total} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-vault-bg/80 backdrop-blur-xl border-b border-vault-border px-5 sm:px-8 py-4 flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-400" aria-label="Menu" aria-expanded={menuOpen}>
            <Menu size={20} />
          </button>
          <div className="relative flex-1 max-w-[420px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items…"
              className="w-full bg-vault-card border border-vault-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40 transition-all"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              disabled={!vault}
              className="flex items-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add item</span>
            </button>
            <div className="hidden sm:flex items-center gap-2.5 pl-2">
              <button
                onClick={() => setProfileOpen(true)}
                title={`${user.email} — edit profile`}
                aria-label="Edit profile"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-vault-accent/30 to-vault-blue/20 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-vault-accent/40 transition-all"
              >
                {user.name[0]?.toUpperCase()}
              </button>
            </div>
            <SignOutButton compact className="lg:hidden" />
          </div>
        </header>

        <div className="flex-1 px-5 sm:px-8 py-6 sm:py-8 flex flex-col gap-8 max-w-[1100px] w-full mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome back, {user.name}</h1>
            <p className="text-sm text-vault-textMuted mt-1">Your encrypted vault — seed phrases, private keys and API keys in one place.</p>
          </div>

          <BalanceCard balanceCents={balanceCents} error={balanceError} onWithdraw={() => setWithdrawOpen(true)} />

          <StatRow total={total} seeds={seeds.length} keys={keys.length} lastUpdated={lastUpdated} />

          {loadError ? (
            <Notice tone="error">{loadError}</Notice>
          ) : !vault ? (
            <Notice>Decrypting your vault…</Notice>
          ) : (
            <>
              {vault.unreadable > 0 && (
                <Notice tone="error">
                  {vault.unreadable} item{vault.unreadable === 1 ? "" : "s"} couldn&apos;t be decrypted and {vault.unreadable === 1 ? "is" : "are"} hidden.
                </Notice>
              )}
              {active === "seed" ? (
                <SeedWalletGrid
                  vaultKey={vaultKey}
                  query={query}
                  seeds={seeds}
                  onSaved={(seed) => updateSeeds((cur) => [seed, ...cur.filter((s) => s.id !== seed.id)])}
                  onRemoved={(id) => updateSeeds((cur) => cur.filter((s) => s.id !== id))}
                />
              ) : (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">
                      {heading} <span className="text-zinc-600 font-medium text-base">({items.length})</span>
                    </h2>
                  </div>

                  {items.length === 0 ? (
                    <Notice>{keys.length === 0 ? "Your vault is empty. Add your first item to get started." : "No items match your search."}</Notice>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {items.map((item) => (
                        <VaultItemCard
                          key={item.id}
                          item={item}
                          vaultKey={vaultKey}
                          onChange={(next) => updateKeys((cur) => cur.map((i) => (i.id === next.id ? next : i)))}
                          onDelete={() => updateKeys((cur) => cur.filter((i) => i.id !== item.id))}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {modalOpen && (
        <AddItemModal
          vaultKey={vaultKey}
          onCreated={(item) => updateKeys((cur) => [item, ...cur])}
          onClose={() => setModalOpen(false)}
        />
      )}

      {withdrawOpen && balanceCents !== null && (
        <WithdrawModal balanceCents={balanceCents} onRequested={setBalanceCents} onClose={() => setWithdrawOpen(false)} />
      )}

      {profileOpen &&<ProfileModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

function Notice({ tone, children }: { tone?: "error"; children: React.ReactNode }) {
  return (
    <div
      className={
        tone === "error"
          ? "bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 text-red-400 text-sm"
          : "bg-vault-card border border-vault-border rounded-2xl p-12 text-center text-vault-textMuted text-sm"
      }
    >
      {children}
    </div>
  );
}
