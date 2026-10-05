"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteEvent } from "@/lib/data/client";
import { formatDateRange } from "@/lib/format";
import { competition as competitionRoute, festival as festivalRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import type { Competition, EventStatus, Festival } from "@/types/content";
import { ConfirmDialog } from "./confirm-dialog";
import { DataTable } from "./data-table";
import { EventForm } from "./event-form";

type Option = { value: string; label: string };
type Kind = "competition" | "festival";
type Row = Competition | Festival;
const TONE: Record<EventStatus, Tone> = { upcoming: "blue", ongoing: "yellow", finished: "gray" };

export function EventsAdmin({ competitions, festivals, regions, categories, actorId }: { competitions: Competition[]; festivals: Festival[]; regions: Option[]; categories: Option[]; actorId: string }) {
  const t = useTranslations("adminPage.events");
  const ts = useTranslations("labels.status");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("competition");
  const [form, setForm] = useState<{ kind: Kind; initial: Row | null; key: number } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: Kind; row: Row } | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteEvent(deleting.kind, deleting.row.id, actorId);
      toast.success(t("deleted"));
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  const table = (k: Kind, rows: Row[]) => {
    const href = (r: Row) => (k === "competition" ? competitionRoute(r.slug) : festivalRoute(r.slug));
    const actions = (r: Row) => (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setForm({ kind: k, initial: r, key: Date.now() })}>
          <Pencil aria-hidden />
          {t("edit")}
        </Button>
        <Button size="sm" variant="ghost" aria-label={t("delete")} onClick={() => setDeleting({ kind: k, row: r })}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    );
    const columns: LegacyColumnDef<Row>[] = [
      { accessorKey: "title", header: t("fieldTitle"), cell: ({ row }) => <Link href={href(row.original)} className="font-medium hover:underline">{row.original.title}</Link> },
      { accessorKey: "startDate", header: t("dates"), cell: ({ row }) => formatDateRange(row.original.startDate, row.original.endDate, locale) },
      { accessorKey: "city", header: t("city") },
      { accessorKey: "status", header: t("status"), cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{ts(row.original.status)}</StatusBadge> },
      { id: "actions", header: "", enableSorting: false, cell: ({ row }) => actions(row.original) },
    ];
    return (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => `${r.title} ${r.city}`}
        emptyTitle={t("empty")}
        mobileCard={(r) => (
          <Card className="gap-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link href={href(r)} className="min-w-0 break-words text-sm font-semibold hover:underline">{r.title}</Link>
              <StatusBadge tone={TONE[r.status]}>{ts(r.status)}</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">{formatDateRange(r.startDate, r.endDate, locale)} · {r.city}</p>
            {actions(r)}
          </Card>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="competition" className="px-3">{t("competitions")} ({competitions.length})</TabsTrigger>
            <TabsTrigger value="festival" className="px-3">{t("festivals")} ({festivals.length})</TabsTrigger>
          </TabsList>
          <Button onClick={() => setForm({ kind, initial: null, key: Date.now() })}>
            <Plus aria-hidden />
            {t("add")}
          </Button>
        </div>
        <TabsContent value="competition" className="pt-3">{table("competition", competitions)}</TabsContent>
        <TabsContent value="festival" className="pt-3">{table("festival", festivals)}</TabsContent>
      </Tabs>
      {form && (
        <EventForm key={form.key} kind={form.kind} initial={form.initial} open onOpenChange={(o) => !o && setForm(null)} regions={regions} categories={categories} actorId={actorId} />
      )}
      <ConfirmDialog open={!!deleting} title={t("deleteTitle")} text={t("deleteText", { title: deleting?.row.title ?? "" })} busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
}
