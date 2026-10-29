"use client";

import { Check, Copy, Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/dashboard/icons";
import { timeAgo } from "@/lib/format";
import { deleteItem, reportAccess, updateKeyItem } from "@/lib/vault-client";
import { CATEGORY_LABEL, CATEGORIES } from "@/lib/vault-data";
import { cn } from "@/lib/utils";
import type { KeyItem } from "@/types/vault";

const ICON_BY_CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.icon]));

interface VaultItemCardProps {
  item: KeyItem;
  vaultKey: CryptoKey;
  onChange: (item: KeyItem) => void;
  onDelete: () => void;
}

export function VaultItemCard({ item, vaultKey, onChange, onDelete }: VaultItemCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleReveal() {
    if (!revealed) reportAccess("item.revealed", item.id);
    setRevealed((r) => !r);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.secret);
      reportAccess("item.copied", item.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard can be unavailable (insecure context or denied permission).
    }
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const toggleFavorite = () =>
    run(async () => {
      const { title, hint, secret, favorite } = item;
      onChange(await updateKeyItem(vaultKey, item, { title, hint, secret, favorite: !favorite }));
    });
  const remove = () =>
    run(async () => {
      await deleteItem(item.id);
      onDelete();
    });

  return (
    <div className="group bg-vault-card border border-vault-border rounded-2xl p-4 hover:border-vault-borderAccent transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-vault-accent/10 flex items-center justify-center text-vault-accent shrink-0">
          <CategoryIcon name={ICON_BY_CAT[item.category]} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
          <div className="text-[12px] text-zinc-600 mt-0.5 truncate">
            {CATEGORY_LABEL[item.category]}
            {item.hint && ` · ${item.hint}`}
          </div>
        </div>
        <button
          onClick={toggleFavorite}
          disabled={busy}
          aria-label={item.favorite ? "Unfavorite" : "Favorite"}
          aria-pressed={item.favorite}
          className="p-1 text-zinc-700 hover:text-vault-accent transition-colors disabled:opacity-50"
        >
          <Star size={15} className={cn(item.favorite && "text-vault-accent fill-vault-accent")} />
        </button>
      </div>

      {/* Masked value row */}
      <div className="mt-3 flex items-center gap-2 bg-[#0e0e14] border border-vault-border rounded-xl px-3 py-2.5">
        <span className={cn("flex-1 text-[13px] font-mono truncate", revealed ? "text-zinc-300" : "text-zinc-600 tracking-[0.2em]")}>
          {revealed ? item.secret : "••••••••••••••••"}
        </span>
        <button
          onClick={toggleReveal}
          aria-label={revealed ? "Hide value" : "Reveal value"}
          className="p-1.5 text-zinc-600 hover:text-vault-accent transition-colors"
        >
          {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button onClick={copy} aria-label="Copy value" className="p-1.5 text-zinc-600 hover:text-vault-accent transition-colors">
          {copied ? <Check size={15} className="text-vault-accent" /> : <Copy size={15} />}
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-zinc-700">
        <span className="first-letter:uppercase">Updated {timeAgo(item.updatedAt)}</span>
        {confirmDelete ? (
          <span className="flex items-center gap-2">
            <button onClick={remove} disabled={busy} className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50">
              Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-zinc-500 hover:text-zinc-300">
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete item"
            className="p-1 text-zinc-700 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
