"use client";

import { useState } from "react";
import { Menu } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Role } from "@/lib/demo/role";
import { Brand } from "./brand";
import { DashboardNav } from "./dashboard-nav";
import type { NavArea } from "./nav-items";

export function MobileNav({ area, role }: { area: NavArea; role: Role }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("common.openMenu")} />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">{t("app.name")}</SheetTitle>
          <Brand href={area === "admin" ? "/admin" : "/cabinet"} />
        </SheetHeader>
        <DashboardNav area={area} role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
