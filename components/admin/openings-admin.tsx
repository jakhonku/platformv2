"use client";

import { useState } from "react";
import { Lock, LockOpen, Trash2 } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteOpening, setOpportunityStatus } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";
import type { LocaleCode } from "@/types/common";
import { OpeningForm, type OpeningOptions } from "@/components/cabinet/opening-form";
import { ConfirmDialog } from "./confirm-dialog";
import { DataTable } from "./data-table";

export type OpeningRow = { key: string; kind: "casting" | "vacancy"; id: string; title: string; organizationName: string; status: "open" | "closed"; deadline: string; applicantsCount: number };

export function OpeningsAdmin({ rows, actorId, organizations, options }: { rows: OpeningRow[]; actorId: string; organizations: { value: string; label: string }[]; options: OpeningOptions }) {
  const t = useTranslations("adminPage.openings");
  const tl = useTranslations("labels.status");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [deleting, setDeleting] = useState<OpeningRow | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast.success(success);
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const href = (r: OpeningRow) => (r.kind === "casting" ? castingRoute(r.id) : vacancyRoute(r.id));
  const actions = (r: OpeningRow) => (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => setOpportunityStatus(r.kind, r.id, r.status === "open" ? "closed" : "open"), t("statusChanged"))}>
        {r.status === "open" ? <Lock aria-hidden /> : <LockOpen aria-hidden />}
        {r.status === "open" ? t("close") : t("reopen")}
      </Button>
      <Button size="sm" variant="ghost" aria-label={t("delete")} onClick={() => setDeleting(r)}>
        <Trash2 aria-hidden />
      </Button>
    </div>
  );

  const columns: LegacyColumnDef<OpeningRow>[] = [
    {
      accessorKey: "title",
      header: t("title"),
      cell: ({ row }) => (
        <Link href={href(row.original)} className="font-medium hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    { accessorKey: "kind", header: t("kind"), cell: ({ row }) => t(`kinds.${row.original.kind}`) },
    { accessorKey: "organizationName", header: t("organization") },
    { accessorKey: "status", header: t("status"), cell: ({ row }) => <StatusBadge tone={row.original.status === "open" ? "green" : "red"}>{tl(row.original.status)}</StatusBadge> },
    { accessorKey: "deadline", header: t("deadline"), cell: ({ row }) => formatDate(row.original.deadline, locale) },
    { accessorKey: "applicantsCount", header: t("applicants") },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => actions(row.original) },
  ];

  return (
    <>
      {organizations.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <OpeningForm kind="casting" options={options} organizations={organizations} />
          <OpeningForm kind="vacancy" options={options} organizations={organizations} />
        </div>
      )}
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.key}
        searchText={(r) => `${r.title} ${r.organizationName}`}
        emptyTitle={t("empty")}
        mobileCard={(r) => (
          <Card className="gap-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link href={href(r)} className="min-w-0 break-words text-sm font-semibold hover:underline">
                {r.title}
              </Link>
              <StatusBadge tone={r.status === "open" ? "green" : "red"}>{tl(r.status)}</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`kinds.${r.kind}`)} · {r.organizationName} · {formatDate(r.deadline, locale)} · {r.applicantsCount}
            </p>
            {actions(r)}
          </Card>
        )}
      />
      <ConfirmDialog
        open={!!deleting}
        title={t("deleteTitle")}
        text={t("deleteText", { title: deleting?.title ?? "" })}
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && run(() => deleteOpening(deleting.kind, deleting.id, actorId), t("deleted"))}
      />
    </>
  );
}
