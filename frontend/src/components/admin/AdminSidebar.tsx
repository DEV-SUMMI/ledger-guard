import Link from "next/link";
import { Activity, ArrowLeft, Gauge, ShieldAlert, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LogoIcon } from "@/components/icons";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { AdminTab } from "@/types/admin";

const NAV: { key: AdminTab; label: string; Icon: typeof Gauge }[] = [
  { key: "overview", label: "Overview", Icon: Gauge },
  { key: "users", label: "Users", Icon: Users },
  { key: "audit", label: "Audit log", Icon: ShieldAlert },
];

interface AdminSidebarProps {
  active: AdminTab;
  onSelect: (tab: AdminTab) => void;
}

export function AdminSidebar({ active, onSelect }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-[232px] shrink-0 border-r border-vault-border bg-vault-card/40 sticky top-0 h-screen px-4 py-6">
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
            onClick={() => onSelect(key)}
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
  );
}
