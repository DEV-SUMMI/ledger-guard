import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { BRAND } from "@/lib/brand";
import { getCurrentUser } from "@/lib/server-session";

export const metadata: Metadata = {
  title: `Admin · ${BRAND.name}`,
  description: `Admin panel for ${BRAND.name}.`,
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // The API enforces admin access too; this just keeps members out of the UI.
  if (user.role !== "admin") redirect("/dashboard");
  return <AdminShell adminId={user.id} />;
}
