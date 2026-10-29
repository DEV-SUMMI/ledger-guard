"use client";

import { Eye, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { api } from "@/lib/api";

const MAX = 500;

/**
 * Edits the member's profile note — a plaintext, non-secret field that administrators
 * can read. It is intentionally separate from the encrypted vault; the disclosure below
 * makes that visible to the member.
 */
export function ProfileModal({ onClose }: { onClose: () => void }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const noteId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    api<{ profileNote: string }>("/profile")
      .then((d) => !cancelled && setNote(d.profileNote))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Couldn't load your profile."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api("/profile", { method: "PATCH", body: { profileNote: note } });
      setSaved(true);
      setTimeout(onClose, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your profile.");
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
        className="relative bg-vault-card border border-vault-border rounded-t-2xl sm:rounded-2xl pt-6 px-5 pb-5 sm:px-7 sm:pb-7 max-w-[480px] w-full [animation:slideUp_.32s_cubic-bezier(.16,1,.3,1)]"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-white">Profile</h3>
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
            <label htmlFor={noteId} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
              Profile note
            </label>
            <textarea
              id={noteId}
              value={note}
              maxLength={MAX}
              disabled={loading}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A short note about this account — e.g. a contact detail or a reference for support."
              rows={5}
              className="w-full bg-[#0e0e14] border border-vault-border rounded-xl px-4 py-3 text-sm text-white placeholder-vault-textFaint outline-none focus:border-vault-accent/40 transition-all resize-none disabled:opacity-50"
            />
            <div className="mt-1 text-right text-[11px] text-zinc-600">
              {note.length}/{MAX}
            </div>
          </div>

          {/* Disclosure: this field is deliberately not private. */}
          <div className="flex gap-2.5 bg-vault-accent/5 border border-vault-accent/20 rounded-xl px-3.5 py-3 text-[12px] text-zinc-300 leading-relaxed">
            <Eye size={15} className="text-vault-accent/80 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-white">Visible to administrators.</span> This note is stored in
              plaintext so support staff can read it. Don&apos;t put secrets here — your seed phrases, private keys and
              API keys stay end-to-end encrypted and remain private to you.
            </p>
          </div>

          {error && <div className="text-[13px] text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={saving || loading}
            className="bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {saved ? "Saved" : saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
