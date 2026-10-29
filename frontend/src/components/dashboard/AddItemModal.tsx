"use client";

import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CATEGORIES } from "@/lib/vault-data";
import { createKeyItem } from "@/lib/vault-client";
import { cn } from "@/lib/utils";
import type { KeyItem } from "@/types/vault";

/** Seed phrases have their own wallet grid, so this form only adds keys. */
const KEY_CATEGORIES = CATEGORIES.filter((c): c is typeof c & { id: KeyItem["category"] } => c.id !== "seed");

const fieldClass =
  "w-full bg-[#0e0e14] border border-vault-border rounded-xl px-4 py-3 text-sm text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40 transition-all";

interface AddItemModalProps {
  vaultKey: CryptoKey;
  onCreated: (item: KeyItem) => void;
  onClose: () => void;
}

export function AddItemModal({ vaultKey, onCreated, onClose }: AddItemModalProps) {
  const [category, setCategory] = useState<KeyItem["category"]>("apikey");
  const [title, setTitle] = useState("");
  const [hint, setHint] = useState("");
  const [secret, setSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const hintId = useId();
  const secretId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const item = await createKeyItem(vaultKey, category, {
        title: title.trim(),
        hint: hint.trim(),
        secret: secret.trim(),
        favorite: false,
      });
      onCreated(item);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the item.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/70 backdrop-blur-sm [animation:fadeIn_.2s_ease]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-vault-card border border-vault-border rounded-t-2xl sm:rounded-2xl pt-7 px-5 pb-5 sm:px-7 sm:pb-7 max-w-[480px] w-full [animation:slideUp_.32s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white">Add vault item</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="flex flex-col gap-4">
          <div>
            <div className="block text-[13px] font-semibold text-zinc-400 mb-1.5">Category</div>
            <div className="grid grid-cols-2 gap-2">
              {KEY_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left transition-all border",
                    category === c.id
                      ? "bg-vault-accent/10 border-vault-accent/30 text-vault-accent"
                      : "bg-[#0e0e14] border-vault-border text-zinc-400 hover:text-white",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor={titleId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
              Name
            </label>
            <input
              id={titleId}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === "apikey" ? "e.g. Exchange API key" : "e.g. Cold wallet"}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor={hintId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
              Note <span className="font-normal text-zinc-600">(optional)</span>
            </label>
            <input
              id={hintId}
              value={hint}
              maxLength={120}
              onChange={(e) => setHint(e.target.value)}
              placeholder={category === "apikey" ? "e.g. Read-only" : "e.g. Ethereum"}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor={secretId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
              {category === "apikey" ? "API key" : "Private key"}
            </label>
            <textarea
              id={secretId}
              value={secret}
              maxLength={8000}
              rows={3}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className={cn(fieldClass, "font-mono resize-none")}
            />
          </div>

          <p className="text-[12px] text-vault-textMuted leading-relaxed">
            Encrypted on this device before it&apos;s saved. Only your password can decrypt it.
          </p>
          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving || !title.trim() || !secret.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold py-3 rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 shadow-[0_8px_24px_rgba(34,211,167,0.22)]"
          >
            {saving ? "Encrypting…" : "Save item"}
          </button>
        </form>
      </div>
    </div>
  );
}
