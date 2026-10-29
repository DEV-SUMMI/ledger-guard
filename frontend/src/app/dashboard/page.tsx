import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BRAND } from "@/lib/brand";
import { getCurrentUser } from "@/lib/server-session";

export const metadata: Metadata = {
  title: `Vault · ${BRAND.name}`,
  description: BRAND.description,
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <DashboardShell user={user} />;
}
