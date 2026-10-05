"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Role } from "@/lib/demo/role";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { DashboardNav } from "./dashboard-nav";
import type { NavArea } from "./nav-items";

const KEY = "sidebar-collapsed";
const EVENT = "sidebar-collapsed-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Yon panel yopiq/ochiq holati brauzerda saqlanadi (admin va kabinet uchun umumiy) */
function useCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = () => {
    try {
      localStorage.setItem(KEY, collapsed ? "0" : "1");
    } catch {
      /* saqlanmasa ham joriy sessiyada almashadi */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [collapsed, toggle];
}

/** Katta ekrandagi yon panel: yopilganda faqat ikonkalar qoladi, ochilganda to'liq ko'rinadi */
export function DashboardSidebar({ area, role, home }: { area: NavArea; role: Role; home: string }) {
  const t = useTranslations("common");
  const [collapsed, toggle] = useCollapsed();
  const label = collapsed ? t("expandSidebar") : t("collapseSidebar");

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-40 hidden h-dvh print:hidden shrink-0 flex-col gap-6 border-r bg-sidebar p-3 transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64 p-4",
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={!collapsed}
        title={label}
        className="absolute top-5 -right-3 z-30 flex size-6 cursor-pointer items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {collapsed ? <ChevronRight className="size-3.5" aria-hidden /> : <ChevronLeft className="size-3.5" aria-hidden />}
      </button>

      <Brand href={home} compact={collapsed} />
      <DashboardNav area={area} role={role} collapsed={collapsed} />
      <Link
        href="/"
        title={collapsed ? t("backToSite") : undefined}
        aria-label={collapsed ? t("backToSite") : undefined}
        className={cn(
          "mt-auto flex items-center gap-2 rounded-xl py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          collapsed ? "justify-center px-0" : "px-2.5",
        )}
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        {!collapsed && t("backToSite")}
      </Link>
    </aside>
  );
}
