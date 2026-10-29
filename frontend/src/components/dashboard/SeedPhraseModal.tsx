"use client";

import { Check, Copy, Eye, EyeOff, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { WalletLogo } from "@/components/dashboard/WalletLogo";
import { cn } from "@/lib/utils";
import type { WalletBrand } from "@/types/vault";

const WORD_COUNTS = [12, 18, 24];

interface SeedPhraseModalProps {
  wallet: WalletBrand;
  /** Previously saved words for this wallet, if any */
  saved?: string[];
  onSave: (words: string[]) => Promise<void>;
  onRemove: () => Promise<void>;
  onClose: () => void;
}

export function SeedPhraseModal({ wallet, saved, onSave, onRemove, onClose }: SeedPhraseModalProps) {
  const [words, setWords] = useState<string[]>(() => saved ?? Array(wallet.words).fill(""));
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filled = words.filter((w) => w.length > 0).length;
  const complete = filled === words.length;

  function resize(count: number) {
    setWords((cur) => Array.from({ length: count }, (_, i) => cur[i] ?? ""));
  }

  function setWord(index: number, value: string) {
    const parts = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // A whole phrase pasted into the first box replaces everything, resizing if it's a standard length.
    if (index === 0 && WORD_COUNTS.includes(parts.length)) {
      setWords(parts);
      return;
    }
    // Several words pasted mid-way spill into the following boxes.
    setWords((cur) => {
      const next = [...cur];
      if (parts.length === 0) next[index] = "";
      parts.slice(0, next.length - index).forEach((p, j) => (next[index + j] = p));
      return next;
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(words.join(" "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context or denied permission); nothing to copy then.
    }
  }

  async function run(action: () => Promise<void>, after: () => void) {
    setBusy(true);
    setError(null);
    try {
      await action();
      after();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    run(
      () => onSave(words),
      () => {
        setJustSaved(true);
        setTimeout(onClose, 800);
      },
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/70 backdrop-blur-sm [animation:fadeIn_.2s_ease]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${wallet.name} seed phrase`}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-vault-card border border-vault-border rounded-t-2xl sm:rounded-2xl pt-6 px-5 pb-5 sm:px-7 sm:pb-7 max-w-[600px] w-full max-h-[92vh] overflow-y-auto [animation:slideUp_.32s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <WalletLogo wallet={wallet} size={40} />
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{wallet.name}</h3>
              <p className="text-[12px] text-zinc-600">
                {saved ? "Seed phrase saved" : "Add your seed phrase"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {WORD_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => resize(n)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all",
                    words.length === n
                      ? "bg-vault-accent/10 border-vault-accent/30 text-vault-accent"
                      : "bg-[#0e0e14] border-vault-border text-zinc-500 hover:text-white",
                  )}
                >
                  {n} words
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                aria-label={revealed ? "Hide words" : "Show words"}
                aria-pressed={revealed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0e0e14] border border-vault-border text-zinc-400 hover:text-vault-accent transition-colors"
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealed ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={copy}
                disabled={!complete}
                aria-label="Copy seed phrase"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0e0e14] border border-vault-border text-zinc-400 hover:text-vault-accent transition-colors disabled:opacity-40 disabled:hover:text-zinc-400"
              >
                {copied ? <Check size={14} className="text-vault-accent" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {words.map((word, i) => (
              <label
                key={i}
                className="flex items-center gap-2 bg-[#0e0e14] border border-vault-border rounded-xl px-3 py-2.5 focus-within:border-vault-accent/40 transition-colors"
              >
                <span className="text-[11px] text-zinc-600 font-mono w-5 shrink-0 text-right">{i + 1}</span>
                <input
                  type={revealed ? "text" : "password"}
                  value={word}
                  onChange={(e) => setWord(i, e.target.value)}
                  aria-label={`Word ${i + 1}`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full min-w-0 bg-transparent text-sm text-white font-mono outline-none placeholder-vault-textFaint"
                />
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <span className={cn(complete ? "text-vault-accent" : "text-zinc-600")}>
              {filled} / {words.length} words
            </span>
            <span className="text-zinc-700">Tip: paste the whole phrase into word 1</span>
          </div>

          <p className="text-[12px] text-vault-textMuted leading-relaxed">
            Encrypted on this device before it&apos;s saved. Only your password can decrypt it.
          </p>
          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <div className="flex gap-2">
            {saved && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(onRemove, onClose)}
                aria-label="Delete seed phrase"
                className="flex items-center justify-center px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={!complete || busy}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold py-3 rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 shadow-[0_8px_24px_rgba(34,211,167,0.22)]"
            >
              {justSaved && <Check size={16} />}
              {justSaved ? "Saved" : busy ? "Encrypting…" : saved ? "Update phrase" : "Save phrase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
