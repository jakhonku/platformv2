"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { useRouter } from "@/i18n/navigation";
import { respondToCollectiveInvite } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import type { CollectiveInvite } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

const TONE: Record<CollectiveInvite["status"], Tone> = { pending: "blue", accepted: "green", declined: "gray" };

/** Jamoa rahbarlaridan kelgan a`zolik takliflari: qabul qilsangiz jamoa tarkibiga qo`shilasiz */
export function CollectiveInvitesList({ items }: { items: (CollectiveInvite & { collectiveName: string })[] }) {
  const t = useTranslations("cabinetPage.offers.collectiveInvites");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  if (items.length === 0) return null;

  async function respond(id: string, status: "accepted" | "declined") {
    if (pending) return;
    setPending(id);
    try {
      await respondToCollectiveInvite(id, status);
      toast.success(t(status === "accepted" ? "acceptedToast" : "declinedToast"));
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="collective-invites" className="flex flex-col gap-3">
      <h2 id="collective-invites" className="text-base font-semibold">
        {t("title")}
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={i.id}>
            <Card className="gap-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{i.collectiveName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("section", { section: i.section })} · {formatDate(i.createdAt, locale)}
                  </p>
                </div>
                <StatusBadge tone={TONE[i.status]}>{t(`status.${i.status}`)}</StatusBadge>
              </div>
              {i.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={pending === i.id} onClick={() => respond(i.id, "accepted")}>
                    {t("accept")}
                  </Button>
                  <Button size="sm" variant="outline" disabled={pending === i.id} onClick={() => respond(i.id, "declined")}>
                    {t("decline")}
                  </Button>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
