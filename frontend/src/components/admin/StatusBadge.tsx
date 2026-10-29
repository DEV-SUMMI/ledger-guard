import { cn } from "@/lib/utils";
import type { AuditLevel, UserStatus } from "@/types/admin";

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-vault-accent/15 text-vault-accent",
  suspended: "bg-red-500/15 text-red-400",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md capitalize", STATUS_STYLES[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const LEVEL_STYLES: Record<AuditLevel, string> = {
  info: "bg-white/[0.06] text-zinc-400",
  warning: "bg-amber-500/15 text-amber-400",
  critical: "bg-red-500/15 text-red-400",
};

export function LevelBadge({ level }: { level: AuditLevel }) {
  return (
    <span className={cn("inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide", LEVEL_STYLES[level])}>
      {level}
    </span>
  );
}
