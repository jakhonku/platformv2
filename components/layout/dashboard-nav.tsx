"use client";

import { filled } from "@/components/icons";
import { AppIcon } from "@/components/ui/app-icon";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Role } from "@/lib/demo/role";
import { isActive } from "@/lib/nav/is-active";
import { cn } from "@/lib/utils";
import { navFor, type NavArea, type NavItem } from "./nav-items";

function NavLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const t = useTranslations();
  const pathname = usePathname();
  const active = isActive(pathname, item.href, item.exact);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? t(item.labelKey) : undefined}
      aria-label={collapsed ? t(item.labelKey) : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl py-1.5 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-2.5",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <AppIcon icon={active ? filled(Icon) : Icon} size="sm" className={active ? "text-primary" : undefined} />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );
}

export function DashboardNav({ area, role, collapsed = false, onNavigate }: { area: NavArea; role: Role; collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navFor(area, role).map((item) => (
        <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
