"use client";

import { Users } from "@/components/icons";
import { MessageSquare } from "@/components/icons";
import { useTranslations } from "next-intl";
import { DeadlineLabel } from "@/components/casting/deadline-label";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "@/i18n/navigation";
import type { CastingItem, VacancyItem } from "@/lib/data";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";

type Row = { kind: "casting" | "vacancy"; item: CastingItem | VacancyItem };

/** Tashkilot e'lonlari (faqat ko'rish): kasting va vakansiyalarni faqat platforma admini qo'shadi va boshqaradi */
export function OpeningsManager({ castings, vacancies }: { orgId: string; castings: CastingItem[]; vacancies: VacancyItem[]; options?: unknown }) {
  const t = useTranslations("cabinetPage.openings");
  const tl = useTranslations("labels.status");

  const rows: Row[] = [...castings.map((item) => ({ kind: "casting" as const, item })), ...vacancies.map((item) => ({ kind: "vacancy" as const, item }))].sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-medium">{t("adminOnlyTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("adminOnlyText")}</p>
        </div>
        <Button nativeButton={false} className="h-10 w-fit rounded-full px-5" render={<Link href="/cabinet/appeals?new=opening_request" />}>
          <MessageSquare aria-hidden /> {t("requestCta")}
        </Button>
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
