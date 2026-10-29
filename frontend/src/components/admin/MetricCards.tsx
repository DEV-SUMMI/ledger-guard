import { Activity, Ban, Database, Users } from "lucide-react";
import type { AdminMetrics } from "@/types/admin";

/** Minimal inline sparkline — pure SVG, no library. */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 120;
  const h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <polyline points={pts} fill="none" stroke="#22d3a7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ label, Icon, children }: { label: string; Icon: typeof Users; children: React.ReactNode }) {
  return (
    <div className="bg-vault-card border border-vault-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-600 font-medium">{label}</span>
        <Icon size={16} className="text-vault-accent" strokeWidth={1.8} />
      </div>
      {children}
    </div>
  );
}

const valueClass = "text-2xl font-black text-white tracking-tight";
const subClass = "text-[11px] font-semibold text-zinc-600";

export function MetricCards({ metrics }: { metrics: AdminMetrics }) {
  const { totals, signups } = metrics;
  const recent = signups.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <Card label="Total users" Icon={Users}>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className={valueClass}>{totals.users.toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-vault-accent">+{recent} in 14 days</span>
          </div>
          {signups.length > 1 && <Sparkline data={signups.map((d) => d.count)} />}
        </div>
      </Card>

      <Card label="Active today" Icon={Activity}>
        <div className={valueClass}>{totals.activeToday.toLocaleString()}</div>
        <span className={subClass}>signed in within 24h</span>
      </Card>

      <Card label="Vault items" Icon={Database}>
        <div className={valueClass}>{totals.items.toLocaleString()}</div>
        <span className={subClass}>all encrypted client-side</span>
      </Card>

      <Card label="Suspended" Icon={Ban}>
        <div className={valueClass}>{totals.suspended.toLocaleString()}</div>
        <span className={subClass}>of {totals.users.toLocaleString()} accounts</span>
      </Card>
    </div>
  );
}
