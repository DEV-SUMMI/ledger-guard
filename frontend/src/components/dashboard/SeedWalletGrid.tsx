"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { SeedPhraseModal } from "@/components/dashboard/SeedPhraseModal";
import { WalletLogo } from "@/components/dashboard/WalletLogo";
import { deleteItem, saveSeed } from "@/lib/vault-client";
import { WALLETS } from "@/lib/wallets";
import type { SeedItem, WalletBrand } from "@/types/vault";

interface SeedWalletGridProps {
  vaultKey: CryptoKey;
  query: string;
  seeds: SeedItem[];
  onSaved: (seed: SeedItem) => void;
  onRemoved: (id: string) => void;
}

export function SeedWalletGrid({ vaultKey, query, seeds, onSaved, onRemoved }: SeedWalletGridProps) {
  const [selected, setSelected] = useState<WalletBrand | null>(null);
  const byWallet = useMemo(() => new Map(seeds.map((s) => [s.walletId, s])), [seeds]);
  const current = selected ? byWallet.get(selected.id) : undefined;

  const wallets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? WALLETS.filter((w) => w.name.toLowerCase().includes(q)) : WALLETS;
  }, [query]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Seed phrases <span className="text-zinc-600 font-medium text-base">({wallets.length})</span>
        </h2>
        <span className="text-[12px] text-zinc-600">{seeds.length} saved</span>
      </div>

      {wallets.length === 0 ? (
        <div className="bg-vault-card border border-vault-border rounded-2xl p-12 text-center text-vault-textMuted text-sm">
          No wallets match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {wallets.map((wallet) => {
            const saved = byWallet.get(wallet.id)?.words;
            return (
              <button
                key={wallet.id}
                onClick={() => setSelected(wallet)}
                className="group bg-vault-card border border-vault-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-vault-borderAccent hover:-translate-y-0.5 transition-all"
              >
                <div className="group-hover:scale-105 transition-transform">
                  <WalletLogo wallet={wallet} />
                </div>
                <div className="text-center min-w-0 w-full">
                  <div className="text-sm font-bold text-white truncate">{wallet.name}</div>
                  {saved ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-vault-accent">
                      <Check size={12} /> {saved.length} words saved
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-zinc-600">Add phrase</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <SeedPhraseModal
          key={selected.id}
          wallet={selected}
          saved={current?.words}
          onSave={async (words) => onSaved(await saveSeed(vaultKey, selected.id, words, current))}
          onRemove={async () => {
            if (!current) return;
            await deleteItem(current.id);
            onRemoved(current.id);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
