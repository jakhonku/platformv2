"use client";

import { useTranslations } from "next-intl";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/admin/data-table";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type PersonRow = { id: string; name: string; phone: string; note: string; linked?: boolean };

/** Import qilingan a`zolar/xodimlar ro`yxati (qidiruv, tartiblash, sahifalash); ko`p qator uchun mos */
export function PeopleList({ rows, noteLabel, emptyTitle }: { rows: PersonRow[]; noteLabel: string; emptyTitle: string }) {
  const t = useTranslations("cabinetPage.import.list");
  const status = (r: PersonRow) => <StatusBadge tone={r.linked ? "green" : "gray"}>{t(r.linked ? "linked" : "notRegistered")}</StatusBadge>;

  const columns: LegacyColumnDef<PersonRow>[] = [
    { accessorKey: "name", header: t("name"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "phone", header: t("phone") },
    { accessorKey: "note", header: noteLabel },
    { id: "status", header: t("status"), enableSorting: false, cell: ({ row }) => status(row.original) },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(r) => r.id}
      searchText={(r) => `${r.name} ${r.phone} ${r.note}`}
      emptyTitle={emptyTitle}
      pageSize={15}
      mobileCard={(r) => (
        <Card className="gap-1 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 break-words text-sm font-semibold">{r.name}</p>
            {status(r)}
          </div>
          <p className="text-xs text-muted-foreground">
            {r.phone}
            {r.note ? ` · ${r.note}` : ""}
          </p>
        </Card>
      )}
    />
  );
}
