"use client";

import { useTransition } from "react";
import { Shuffle } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/navigation";
import { setDemoRole } from "@/lib/demo/actions";
import { ROLES, type Role } from "@/lib/demo/role";

// Faqat server (DashboardShell / PublicHeader) isDemoEnabled() true bo'lganda renderlaydi
export function DemoRoleSwitcher({ current }: { current: Role }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={pending} />}>
        <Shuffle />
        <span className="hidden sm:inline">{t("demo.switchRole")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t("demo.currentRole")}: {t(`roles.${current}`)}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            aria-current={r === current}
            onClick={() =>
              startTransition(async () => {
                await setDemoRole(r);
                router.refresh();
              })
            }
          >
            {t(`roles.${r}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
