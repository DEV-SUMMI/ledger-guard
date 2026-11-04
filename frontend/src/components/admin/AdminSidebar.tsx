import Link from "next/link";
import { Activity, ArrowLeft, Banknote, Gauge, ShieldAlert, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LogoIcon } from "@/components/icons";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { AdminTab } from "@/types/admin";

const NAV: { key: AdminTab; label: string; Icon: typeof Gauge }[] = [
  { key: "overview", label: "Overview", Icon: Gauge },
  { key: "users", label: "Users", Icon: Users },
  { key: "withdrawals", label: "Withdrawals", Icon: Banknote },
  { key: "audit", label: "Audit log", Icon: ShieldAlert },
];

interface AdminSidebarProps {
  active: AdminTab;
  onSelect: (tab: AdminTab) => void;
  /** Mobile drawer state; ignored at `lg` and up, where the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ active, onSelect, open, onClose }: AdminSidebarProps) {
  return (
    <>
    <div
      onClick={onClose}
      aria-hidden
      className={cn("fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
    />
    <aside
      className={cn(
        "flex flex-col w-[232px] shrink-0 border-r border-vault-border bg-vault-bg px-4 py-6 overflow-y-auto",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:z-auto lg:translate-x-0 lg:bg-vault-card/40",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-2">
        <span className="text-vault-accent">
          <LogoIcon size={24} />
        </span>
        <span className="text-lg font-extrabold text-white tracking-tight">{BRAND.name}</span>
      </Link>
      <div className="flex items-center gap-1.5 px-2 mb-8">
        <Activity size={12} className="text-vault-accent" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-vault-accent">Admin</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => {
              onSelect(key);
              onClose();
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
              active === key ? "bg-vault-accent/10 text-vault-accent" : "text-zinc-500 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-vault-accent/20 bg-vault-accentDim p-4">
          <div className="text-xs font-bold text-vault-accent mb-1">Zero-knowledge</div>
          <p className="text-[12px] leading-relaxed text-vault-textMuted">
            Admins see accounts and activity, never vault contents. Suspending a member signs them out everywhere.
          </p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-[13px] text-zinc-600 hover:text-zinc-300 transition-colors">
          <ArrowLeft size={14} />
          Back to app
        </Link>
        <SignOutButton className="-mt-3" />
      </div>
    </aside>
    </>
  );
}
