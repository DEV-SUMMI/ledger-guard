import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { LevelBadge } from "@/components/admin/StatusBadge";
import { timeAgo } from "@/lib/format";
import type { AuditEvent, AuditLevel } from "@/types/admin";

const LEVEL_ICON: Record<AuditLevel, React.ReactNode> = {
  info: <CircleCheck size={16} className="text-zinc-500" />,
  warning: <TriangleAlert size={16} className="text-amber-400" />,
  critical: <CircleAlert size={16} className="text-red-400" />,
};

export function AuditLog({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="bg-vault-card border border-vault-border rounded-2xl p-10 text-center text-sm text-vault-textMuted">
        No events yet.
      </div>
    );
  }

  return (
    <div className="bg-vault-card border border-vault-border rounded-2xl divide-y divide-vault-border/60">
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
          <span className="mt-0.5 shrink-0">{LEVEL_ICON[e.level]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white">{e.event}</span>
              <LevelBadge level={e.level} />
            </div>
            {e.detail && <div className="text-[12px] text-vault-textMuted mt-0.5 break-words">{e.detail}</div>}
            <div className="text-[11px] text-zinc-600 mt-1 font-mono truncate">
              {e.actor ?? "system"}
              {e.ip && ` · ${e.ip}`}
            </div>
          </div>
          <span title={new Date(e.createdAt).toLocaleString()} className="text-[11px] text-zinc-600 shrink-0 whitespace-nowrap">
            {timeAgo(e.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
