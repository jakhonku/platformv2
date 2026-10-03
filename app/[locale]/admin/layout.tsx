import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "@/i18n/navigation";
import { getDemoRole } from "@/lib/demo/server";

// Admin panel faqat admin va moderator uchun; boshqa rollar bosh sahifaga yo'naltiriladi
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const role = await getDemoRole();
  if (role !== "admin" && role !== "moderator") redirect({ href: "/", locale });

  return <DashboardShell area="admin">{children}</DashboardShell>;
}
