"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** Mobil (lg dan kichik) ekranda filtrlar drawer ichida; faol filtrlar soni tugmada ko'rinadi */
export function FilterDrawer({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const t = useTranslations("catalog");
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          <SlidersHorizontal aria-hidden />
          {t("filtersButton")}
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(22rem,100vw)] gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b p-4">
            <SheetTitle>{t("filtersTitle")}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          <SheetFooter className="border-t p-4">
            <SheetClose render={<Button className="w-full" />}>{t("showResults")}</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
