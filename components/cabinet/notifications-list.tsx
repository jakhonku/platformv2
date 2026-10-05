"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link, useRouter } from "@/i18n/navigation";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LocaleCode } from "@/types/common";
import type { Notification } from "@/types/system";

export function NotificationsList({ items, userId }: { items: Notification[]; userId: string }) {
  const t = useTranslations("cabinetPage.notifications");
  const tc = useTranslations("cabinetPage.settings.channels");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  async function run(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {t("unreadCount", { count: unread })}
        </p>
        <Button variant="outline" size="sm" disabled={busy || unread === 0} onClick={() => run(() => markAllNotificationsRead(userId))}>
          <CheckCheck aria-hidden />
          {t("markAll")}
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((n) => (
          <li key={n.id} className={cn("flex flex-col gap-1 rounded-xl border p-3", !n.read && "border-primary/30 bg-primary/5")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 break-words text-sm font-semibold">{n.title}</p>
              <StatusBadge tone="gray">{tc(n.channel)}</StatusBadge>
            </div>
            <p className="break-words text-sm text-muted-foreground">{n.body}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDate(n.createdAt, locale)}</span>
              {n.link && (
                <Link href={n.link} className="font-medium text-primary hover:underline">
                  {t("open")}
                </Link>
              )}
              {!n.read && (
                <button type="button" disabled={busy} onClick={() => run(() => markNotificationRead(n.id))} className="font-medium text-primary hover:underline disabled:opacity-50">
                  {t("markRead")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
