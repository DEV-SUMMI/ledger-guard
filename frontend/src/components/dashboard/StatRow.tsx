import { Clock, Database, FolderLock, KeyRound } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface StatRowProps {
  total: number;
  seeds: number;
  keys: number;
  /** ISO time of the most recently changed item, if any */
  lastUpdated: string | null;
}

export function StatRow({ total, seeds, keys, lastUpdated }: StatRowProps) {
  const cards = [
    { label: "Stored items", value: String(total), Icon: Database },
    { label: "Seed phrases", value: String(seeds), Icon: FolderLock },
    { label: "Keys", value: String(keys), Icon: KeyRound },
    { label: "Last change", value: timeAgo(lastUpdated), Icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, Icon }) => (
        <div key={label} className="bg-vault-card border border-vault-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-600 font-medium">{label}</span>
            <span className="text-vault-accent">
              <Icon size={16} strokeWidth={1.8} />
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight first-letter:uppercase">{value}</div>
        </div>
      ))}
    </div>
  );
}
