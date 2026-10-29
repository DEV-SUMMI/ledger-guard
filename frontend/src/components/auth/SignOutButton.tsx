"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** Ends the session and drops the in-memory vault key. `compact` renders an icon button for headers. */
export function SignOutButton({ compact = false, className }: { compact?: boolean; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        aria-label="Sign out"
        className={cn("p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors disabled:opacity-50", className)}
      >
        <LogOut size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50 text-left",
        className,
      )}
    >
      <LogOut size={14} />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
