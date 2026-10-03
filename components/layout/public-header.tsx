import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getDemoRole } from "@/lib/demo/server";
import { isDemoEnabled } from "@/lib/demo/role";
import { Brand } from "./brand";
import { DemoRoleSwitcher } from "./demo-role-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { PUBLIC_NAV, PUBLIC_NAV_PRIMARY } from "./nav-items";
import { PublicMobileNav } from "./public-mobile-nav";

export async function PublicHeader() {
  const t = await getTranslations();
  const role = await getDemoRole();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-6">
        <PublicMobileNav />
        <Brand />
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.filter((i) => PUBLIC_NAV_PRIMARY.includes(i.href)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        {isDemoEnabled() && <DemoRoleSwitcher current={role} />}
        <LanguageSwitcher />
        <Button nativeButton={false} variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/login" />}>
          {t("nav.login")}
        </Button>
        <Button nativeButton={false} size="sm" render={<Link href="/register" />}>
          {t("nav.register")}
        </Button>
      </div>
    </header>
  );
}
