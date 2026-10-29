import { FolderLock, Key, KeyRound } from "lucide-react";
import type { Category } from "@/types/vault";

const MAP = {
  "folder-lock": FolderLock,
  "key-round": KeyRound,
  key: Key,
} as const;

export function CategoryIcon({ name, size = 18 }: { name: Category["icon"]; size?: number }) {
  const Icon = MAP[name];
  return <Icon size={size} strokeWidth={1.8} />;
}
