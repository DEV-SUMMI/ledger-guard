import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LogoIcon } from "@/components/icons";
import { CategoryIcon } from "@/components/dashboard/icons";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/vault-data";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/vault";

interface SidebarProps {
  active: CategoryId | "all";
  counts: Record<string, number>;
  onSelect: (id: CategoryId | "all") => void;
  total: number;
}

export function Sidebar({ active, counts, onSelect, total }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-[248px] shrink-0 border-r border-vault-border bg-vault-card/40 sticky top-0 h-screen px-4 py-6">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-9">
        <span className="text-vault-accent">
          <LogoIcon size={24} />
        </span>
        <span className="text-lg font-extrabold text-white tracking-tight">{BRAND.name}</span>
      </Link>

      <button
        onClick={() => onSelect("all")}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
          active === "all" ? "bg-vault-accent/10 text-vault-accent" : "text-zinc-500 hover:text-white hover:bg-white/[0.04]",
        )}
      >
        <LayoutDashboard size={18} strokeWidth={1.8} />
        <span className="flex-1">All items</span>
        <span className="text-xs text-zinc-600">{total}</span>
      </button>

      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 px-3 mt-6 mb-2">Categories</div>
      <nav className="flex flex-col gap-0.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
              active === c.id ? "bg-vault-accent/10 text-vault-accent" : "text-zinc-500 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            <CategoryIcon name={c.icon} />
            <span className="flex-1 truncate">{c.label}</span>
            <span className="text-xs text-zinc-600">{counts[c.id] ?? 0}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-vault-accent/20 bg-vault-accentDim p-4">
          <div className="text-xs font-bold text-vault-accent mb-1">End-to-end encrypted</div>
          <p className="text-[12px] leading-relaxed text-vault-textMuted">
            Items are encrypted in this browser with a key only your password unlocks. The server stores ciphertext.
          </p>
        </div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-600 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={14} />
          Back to site
        </Link>
        <SignOutButton className="-mt-3" />
      </div>
    </aside>
  );
}
