import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell area="cabinet">{children}</DashboardShell>;
}
