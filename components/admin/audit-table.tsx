"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { formatDate } from "@/lib/format";
import type { LocaleCode } from "@/types/common";
import type { AuditLogEntry } from "@/types/system";
import { DataTable } from "./data-table";

export function AuditTable({ items, actors }: { items: AuditLogEntry[]; actors: Record<string, string> }) {
  const t = useTranslations("adminPage.audit");
  const locale = useLocale() as LocaleCode;
  const [action, setAction] = useState("");
  const actions = useMemo(() => [...new Set(items.map((i) => i.action))].sort(), [items]);
  const rows = action ? items.filter((i) => i.action === action) : items;
  const actor = (id: string) => actors[id] ?? id;
  const when = (iso: string) => `${formatDate(iso, locale)} ${iso.slice(11, 16)}`;

  const columns: LegacyColumnDef<AuditLogEntry>[] = [
    { accessorKey: "at", header: t("when"), cell: ({ row }) => when(row.original.at) },
    { id: "actor", header: t("actor"), accessorFn: (r) => actor(r.actorId) },
    { accessorKey: "action", header: t("action"), cell: ({ row }) => <code className="text-xs">{row.original.action}</code> },
    { id: "entity", header: t("entity"), accessorFn: (r) => `${r.entityType} · ${r.entityId}` },
    { accessorKey: "details", header: t("details"), enableSorting: false, cell: ({ row }) => <span className="break-words text-muted-foreground">{row.original.details ?? "—"}</span> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-w-xs flex-col gap-1.5">
        <label htmlFor="audit-action" className="text-sm font-medium">
          {t("filter")}
        </label>
        <NativeSelect id="audit-action" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">{t("all")}</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </NativeSelect>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => `${actor(r.actorId)} ${r.action} ${r.entityType} ${r.entityId} ${r.details ?? ""}`}
        emptyTitle={t("empty")}
        pageSize={15}
        mobileCard={(r) => (
          <Card className="gap-1 p-4">
            <p className="text-xs text-muted-foreground">
              {when(r.at)} · {actor(r.actorId)}
            </p>
            <p className="text-sm">
              <code className="text-xs">{r.action}</code> · {r.entityType} {r.entityId}
            </p>
            {r.details && <p className="break-words text-xs text-muted-foreground">{r.details}</p>}
          </Card>
        )}
      />
    </div>
  );
}
