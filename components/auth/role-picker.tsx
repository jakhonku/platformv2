"use client";

import { useState } from "react";
import { Building2, ClipboardList, Mic, Music, PenLine, ShieldCheck, UsersRound, Wand2, type Icon } from "@/components/icons";
import { useTranslations } from "next-intl";
import { AppIcon } from "@/components/ui/app-icon";
import { useRouter } from "@/i18n/navigation";
import { homeFor } from "@/lib/auth/flow";
import { signInAs } from "@/lib/demo/actions";
import type { Role } from "@/lib/demo/role";
import { cn } from "@/lib/utils";

const ROLES: { role: Role; icon: Icon }[] = [
  { role: "musician", icon: Music },
  { role: "vocalist", icon: Mic },
  { role: "conductor", icon: Wand2 },
  { role: "composer", icon: PenLine },
  { role: "collective", icon: UsersRound },
  { role: "organization", icon: Building2 },
  { role: "moderator", icon: ClipboardList },
  { role: "admin", icon: ShieldCheck },
];

/** Taqdimot uchun: login/parolsiz, rolni tanlab bir bosishda kirish */
export function RolePicker() {
  const t = useTranslations("auth.picker");
  const tr = useTranslations("roles");
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);

  async function enter(role: Role) {
    if (pending) return;
    setPending(role);
    try {
      await signInAs(role);
      router.push(homeFor(role));
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="stagger-in grid gap-2.5 sm:grid-cols-2">
      {ROLES.map(({ role, icon: RoleIcon }, index) => (
        <button
          key={role}
          style={{ "--i": index } as React.CSSProperties}
          type="button"
          disabled={pending !== null}
          onClick={() => enter(role)}
          className={cn(
            "glass glass-hover flex min-w-0 items-center gap-3 rounded-3xl p-3 text-left focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60",
            pending === role && "ring-2 ring-primary/50",
          )}
        >
          <AppIcon icon={RoleIcon} size="md" />
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">{tr(role)}</span>
            <span className="text-xs text-muted-foreground">{t(`desc.${role}`)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
