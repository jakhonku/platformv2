import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getDemoRole } from "@/lib/demo/server";
import { isDemoEnabled } from "@/lib/demo/role";
import { Brand } from "./brand";
import { DemoRoleSwitcher } from "./demo-role-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { PUBLIC_NAV, PUBLIC_NAV_PRIMARY } from "./nav-items";
import { PublicMobileNav } from "./public-mobile-nav";

export async function PublicHeader() {
  const t = await getTranslations();
  const role = await getDemoRole();

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <div className="glass-strong mx-auto flex h-14 w-full max-w-7xl items-center gap-2 rounded-full px-3 sm:px-4">
        <PublicMobileNav />
        <Brand />
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.filter((i) => PUBLIC_NAV_PRIMARY.includes(i.href)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        {isDemoEnabled() && <DemoRoleSwitcher current={role} />}
        <ThemeToggle />
        <LanguageSwitcher />
        <Button nativeButton={false} size="sm" variant="ghost" className="hidden h-8 rounded-full px-3.5 sm:inline-flex" render={<Link href="/login" />}>
          {t("nav.login")}
        </Button>
        <Button nativeButton={false} size="sm" className="hidden h-8 rounded-full px-4 sm:inline-flex" render={<Link href="/register" />}>
          {t("nav.register")}
        </Button>
        <Button nativeButton={false} size="sm" className="h-8 rounded-full px-4 sm:hidden" render={<Link href="/login" />}>
          {t("nav.login")}
        </Button>
      </div>
    </header>
  );
}
