import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { getNotifications } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";
import { isDemoEnabled } from "@/lib/demo/role";
import { Brand } from "./brand";
import { DashboardNav } from "./dashboard-nav";
import { DemoRoleSwitcher } from "./demo-role-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import type { NavArea } from "./nav-items";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

// RTTM dashboard layouti: chap sidebar + yuqori header + kontent
export async function DashboardShell({ area, children }: { area: NavArea; children: React.ReactNode }) {
  const subject = await getDemoSubject();
  const role = subject.role;
  const t = await getTranslations();
  // Kabinet header'idagi qo'ng'iroqcha uchun o'qilmagan xabarlar soni (xato bo'lsa 0)
  const unread = area === "cabinet" && subject.userId ? await getNotifications(subject.userId).then((n) => n.filter((x) => !x.read).length, () => 0) : 0;
  const home = area === "admin" ? "/admin" : "/cabinet";

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 lg:flex">
        <Brand href={home} />
        <DashboardNav area={area} role={role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-6">
          <MobileNav area={area} role={role} />
          <div className="relative hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder={t("common.search")} aria-label={t("common.search")} className="pl-8" />
          </div>
          <div className="flex-1" />
          {isDemoEnabled() && <DemoRoleSwitcher current={role} />}
          <NotificationBell href={area === "admin" ? "/admin" : "/cabinet/notifications"} unread={unread} />
          <LanguageSwitcher />
          <UserMenu fullName={subject.name || t("common.demoUser")} roleLabel={t(`roles.${role}`)} profileHref={area === "admin" ? "/admin" : "/cabinet/profile"} />
        </header>
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
