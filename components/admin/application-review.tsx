"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ModerationItem, ModerationKind } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { reviewTab, type ReviewTab } from "@/lib/review";
import type { LocaleCode } from "@/types/common";
import { DataTable } from "./data-table";
import { ReviewPanel } from "./review-panel";

const TABS: ReviewTab[] = ["new", "in_review", "approved", "rejected"];

/**
 * Arizalar/materiallar jadvali: holat bo`yicha tablar (Yangi, Tekshiruvda, Tasdiqlangan, Rad etilgan),
 * qator bosilsa yon panelda tafsilot va qaror.
 */
export function ApplicationReview({ kind, items, actorId, actors }: { kind: ModerationKind; items: ModerationItem[]; actorId: string; actors: Record<string, string> }) {
  const t = useTranslations("adminPage.review");
  const locale = useLocale() as LocaleCode;
  const [tab, setTab] = useState<ReviewTab>("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withTab = useMemo(() => items.map((i) => ({ item: i, tab: reviewTab(i.status, i.review) })), [items]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((x) => [x, withTab.filter((r) => r.tab === x).length])) as Record<ReviewTab, number>, [withTab]);
  const rows = useMemo(() => withTab.filter((r) => r.tab === tab).map((r) => r.item), [withTab, tab]);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  // Media uchun "Tekshiruvda" bosqichi yo`q
  const tabs = kind === "media" ? TABS.filter((x) => x !== "in_review") : TABS;
  const active = tabs.includes(tab) ? tab : "new";

  const percentTone = (p: number): Tone => (p === 100 ? "green" : p >= 60 ? "yellow" : "red");
  const assignee = (i: ModerationItem) => (i.review?.assigneeId ? (actors[i.review.assigneeId] ?? i.review.assigneeId) : "—");

  const columns: LegacyColumnDef<ModerationItem>[] = [
    {
      accessorKey: "title",
      header: t("columns.name"),
      cell: ({ row }) => (
        <button type="button" onClick={() => setSelectedId(row.original.id)} className="text-left font-medium hover:underline">
          {row.original.title}
          <span className="block text-xs font-normal text-muted-foreground">{row.original.subtitle}</span>
        </button>
      ),
    },
    ...(kind === "media" ? [] : ([{ id: "phone", header: t("columns.phone"), accessorFn: (r: ModerationItem) => r.phone ?? "—" }] as LegacyColumnDef<ModerationItem>[])),
    { accessorKey: "submittedAt", header: t("columns.date"), cell: ({ row }) => formatDate(row.original.submittedAt, locale) },
    ...(kind === "media"
      ? []
      : ([
          { id: "percent", header: t("columns.completeness"), accessorFn: (r: ModerationItem) => r.completeness?.percent ?? 0, cell: ({ row }: { row: { original: ModerationItem } }) => <StatusBadge tone={percentTone(row.original.completeness?.percent ?? 0)}>{row.original.completeness?.percent ?? 0}%</StatusBadge> },
          { id: "assignee", header: t("columns.assignee"), accessorFn: (r: ModerationItem) => assignee(r) },
        ] as LegacyColumnDef<ModerationItem>[])),
    {
      id: "open",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedId(row.original.id)}>
          {t("open")}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={active} onValueChange={(v) => setTab(v as ReviewTab)}>
        <div className="max-w-full overflow-x-auto">
          <TabsList>
            {tabs.map((x) => (
              <TabsTrigger key={x} value={x} className="px-3">
                {t(`tabs.${x}`)} ({counts[x]})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <p className="text-sm text-muted-foreground">{t(`tabHints.${active}`)}</p>

      <DataTable
        key={`${kind}-${active}`}
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.title} ${r.subtitle} ${r.phone ?? ""} ${r.meta?.owner ?? ""} ${r.meta?.stir ?? ""}`}
        emptyTitle={t(`empty.${active}`)}
        mobileCard={(r) => (
          <Card className="gap-2 p-4">
            <button type="button" onClick={() => setSelectedId(r.id)} className="text-left">
              <span className="block break-words text-sm font-semibold">{r.title}</span>
              <span className="block text-xs text-muted-foreground">{r.subtitle}</span>
            </button>
            <p className="text-xs text-muted-foreground">
              {formatDate(r.submittedAt, locale)}
              {r.phone ? ` · ${r.phone}` : ""}
            </p>
            {kind !== "media" && (
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={percentTone(r.completeness?.percent ?? 0)}>{r.completeness?.percent ?? 0}%</StatusBadge>
                <span className="text-xs text-muted-foreground">{assignee(r)}</span>
              </div>
            )}
            <Button size="sm" variant="outline" className="w-fit" onClick={() => setSelectedId(r.id)}>
              {t("open")}
            </Button>
          </Card>
        )}
      />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader className="border-b p-4">
                <SheetTitle className="break-words">{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.subtitle} · {formatDate(selected.submittedAt, locale)}
                </SheetDescription>
              </SheetHeader>
              <div className="pt-4">
                <ReviewPanel item={selected} actorId={actorId} actors={actors} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
