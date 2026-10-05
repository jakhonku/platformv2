"use client";

import { Briefcase, filled, Music, Newspaper, Search, Users } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isActive } from "@/lib/nav/is-active";
import { cn } from "@/lib/utils";

const TAB_DEFS = [
  { href: "/", labelKey: "nav.home", icon: Search, exact: true },
  { href: "/musicians", labelKey: "nav.musicians", icon: Music },
  { href: "/orchestras", labelKey: "nav.orchestras", icon: Users },
  { href: "/castings", labelKey: "nav.castings", icon: Briefcase },
  { href: "/news", labelKey: "nav.news", icon: Newspaper },
] as const;
const TABS = TAB_DEFS.map((d) => ({ ...d, fill: filled(d.icon) }));

/** iOS uslubidagi pastki shisha tab-bar — faqat mobilda */
export function PublicTabBar() {
  const t = useTranslations();
  const pathname = usePathname();
  return (
    <nav
      aria-label={t("common.mainNav")}
      className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[1.75rem] p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {TABS.map(({ href, labelKey, icon: Icon, fill: IconFill, ...rest }) => {
        const active = isActive(pathname, href, "exact" in rest ? rest.exact : false);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[0.65rem] font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-foreground/60",
            )}
          >
            {active ? <IconFill className="size-6" aria-hidden /> : <Icon className="size-6" aria-hidden />}
            <span className="max-w-full truncate">{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

