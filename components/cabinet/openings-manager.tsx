"use client";

import { useState } from "react";
import { Users } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DeadlineLabel } from "@/components/casting/deadline-label";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link, useRouter } from "@/i18n/navigation";
import { setOpportunityStatus } from "@/lib/data/client";
import type { CastingItem, VacancyItem } from "@/lib/data";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";
import { OpeningForm, type OpeningOptions } from "./opening-form";

type Row = { kind: "casting" | "vacancy"; item: CastingItem | VacancyItem };

export function OpeningsManager({ orgId, castings, vacancies, options }: { orgId: string; castings: CastingItem[]; vacancies: VacancyItem[]; options: OpeningOptions }) {
  const t = useTranslations("cabinetPage.openings");
  const tl = useTranslations("labels.status");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const rows: Row[] = [...castings.map((item) => ({ kind: "casting" as const, item })), ...vacancies.map((item) => ({ kind: "vacancy" as const, item }))].sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt));

  async function toggle(row: Row) {
    if (pending) return;
    setPending(row.item.id);
    try {
      await setOpportunityStatus(row.kind, row.item.id, row.item.status === "open" ? "closed" : "open");
      toast.success(t("statusChanged"));
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <OpeningForm kind="casting" orgId={orgId} options={options} />
        <OpeningForm kind="vacancy" orgId={orgId} options={options} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rows.map((r) => {
            const closed = r.item.status === "closed";
            return (
              <li key={`${r.kind}-${r.item.id}`}>
                <Card className="h-full gap-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link href={r.kind === "casting" ? castingRoute(r.item.id) : vacancyRoute(r.item.id)} className="min-w-0 break-words text-sm font-semibold hover:underline">
                      {r.item.title}
                    </Link>
                    <StatusBadge tone={closed ? "red" : "green"}>{tl(r.item.status)}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`kind.${r.kind}`)} · {t("applicants", { count: r.item.applicantsCount })}
                  </p>
                  <DeadlineLabel deadline={r.item.deadline} closed={closed} />
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" disabled={pending === r.item.id} onClick={() => toggle(r)}>
                      {closed ? t("reopen") : t("close")}
                    </Button>
                    <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/cabinet/candidates?opening=${r.item.id}`} />}>
                      <Users aria-hidden />
                      {t("candidates")}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
