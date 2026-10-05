"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { useRouter } from "@/i18n/navigation";
import { respondToInvitation } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import type { LocaleCode } from "@/types/common";
import type { Invitation } from "@/types/invitation";

const TONE: Record<NonNullable<Invitation["status"]>, Tone> = { new: "blue", accepted: "green", declined: "gray" };

export function OffersList({ items }: { items: Invitation[] }) {
  const t = useTranslations("cabinetPage.offers");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  if (items.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;

  async function respond(id: string, status: "accepted" | "declined") {
    if (pending) return;
    setPending(id);
    try {
      await respondToInvitation(id, status);
      toast.success(t(status === "accepted" ? "acceptedToast" : "declinedToast"));
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(null);
    }
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((o) => {
        const status = o.status ?? "new";
        return (
          <li key={o.id}>
            <Card className="gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{o.senderName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt, locale)} · {o.contact}
                  </p>
                </div>
                <StatusBadge tone={TONE[status]}>{t(`status.${status}`)}</StatusBadge>
              </div>
              <p className="whitespace-pre-line break-words text-sm">{o.message}</p>
              {status === "new" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={pending === o.id} onClick={() => respond(o.id, "accepted")}>
                    {t("accept")}
                  </Button>
                  <Button size="sm" variant="outline" disabled={pending === o.id} onClick={() => respond(o.id, "declined")}>
                    {t("decline")}
                  </Button>
                </div>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
