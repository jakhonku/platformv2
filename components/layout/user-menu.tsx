"use client";

import { ArrowLeft, Globe, LogOut, Settings, UserRound } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/demo/actions";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({
  fullName,
  roleLabel,
  profileHref,
  settingsHref,
  publicHref,
  photoUrl,
}: {
  fullName: string;
  roleLabel: string;
  profileHref: string;
  /** Shaxsiy profil sozlamalari sahifasi (rasm, bildirishnomalar) */
  settingsHref?: string;
  /** Ommaviy profil sahifasi (bo'lsa) */
  publicHref?: string | null;
  photoUrl?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" aria-label={t("common.userMenu")} />}
      >
        <Avatar className="size-8">
          {photoUrl && <AvatarImage src={photoUrl} alt="" />}
          <AvatarFallback>{initials(fullName) || "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate text-foreground">{fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">{roleLabel}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={profileHref} />}>
          <UserRound /> {t("cabinet.profile")}
        </DropdownMenuItem>
        {settingsHref && (
          <DropdownMenuItem render={<Link href={settingsHref} />}>
            <Settings /> {t("common.profileSettings")}
          </DropdownMenuItem>
        )}
        {publicHref && (
          <DropdownMenuItem render={<Link href={publicHref} />}>
            <Globe /> {t("common.publicProfile")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/" />}>
          <ArrowLeft /> {t("common.backToSite")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut /> {t("common.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
