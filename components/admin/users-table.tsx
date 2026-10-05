"use client";

import { useState } from "react";
import { Ban, Check, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { useRouter } from "@/i18n/navigation";
import { setUserRoles, setUserStatus } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";
import { ROLES, type Role } from "@/lib/demo/role";
import { formatDate } from "@/lib/format";
import type { LocaleCode } from "@/types/common";
import type { User } from "@/types/user";
import { DataTable } from "./data-table";

const TONE: Record<User["status"], Tone> = { active: "green", pending: "yellow", blocked: "red" };
const ASSIGNABLE = ROLES.filter((r) => r !== "guest");

export function UsersTable({ users, actorId }: { users: User[]; actorId: string }) {
  const t = useTranslations("adminPage.users");
  const tr = useTranslations("roles");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [editing, setEditing] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, success: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast.success(success);
      setEditing(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof DataError && error.code === "forbidden" ? t("lastAdmin") : t("error"));
    } finally {
      setBusy(false);
    }
  }

  const actions = (u: User) => (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => (setRoles(u.roles), setEditing(u))}>
        <ShieldCheck aria-hidden />
        {t("editRoles")}
      </Button>
      {u.status === "blocked" ? (
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => setUserStatus(u.id, "active", actorId), t("unblocked"))}>
          <Check aria-hidden />
          {t("unblock")}
        </Button>
      ) : (
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => setUserStatus(u.id, "blocked", actorId), t("blocked"))}>
          <Ban aria-hidden />
          {t("block")}
        </Button>
      )}
    </div>
  );

  const roleBadges = (u: User) => (
    <div className="flex flex-wrap gap-1">
      {u.roles.map((r) => (
        <StatusBadge key={r} tone="blue">
          {tr(r)}
        </StatusBadge>
      ))}
    </div>
  );

  const columns: LegacyColumnDef<User>[] = [
    { accessorKey: "fullName", header: t("name"), cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span> },
    {
      id: "contact",
      header: t("contact"),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.email}
          <br />
          {row.original.phone}
        </span>
      ),
    },
    { id: "roles", header: t("roles"), enableSorting: false, cell: ({ row }) => roleBadges(row.original) },
    { accessorKey: "status", header: t("status"), cell: ({ row }) => <StatusBadge tone={TONE[row.original.status]}>{t(`statuses.${row.original.status}`)}</StatusBadge> },
    { accessorKey: "createdAt", header: t("created"), cell: ({ row }) => formatDate(row.original.createdAt, locale) },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => actions(row.original) },
  ];

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        getRowId={(u) => u.id}
        searchText={(u) => `${u.fullName} ${u.email} ${u.phone}`}
        emptyTitle={t("empty")}
        mobileCard={(u) => (
          <Card className="gap-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="min-w-0 break-words text-sm font-semibold">{u.fullName}</p>
              <StatusBadge tone={TONE[u.status]}>{t(`statuses.${u.status}`)}</StatusBadge>
            </div>
            <p className="break-all text-xs text-muted-foreground">
              {u.email} · {u.phone}
            </p>
            {roleBadges(u)}
            {actions(u)}
          </Card>
        )}
      />
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editRoles")}</DialogTitle>
            <DialogDescription>{editing?.fullName}</DialogDescription>
          </DialogHeader>
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">{t("roles")}</legend>
            {ASSIGNABLE.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={roles.includes(r)} onChange={(e) => setRoles((cur) => (e.target.checked ? [...cur, r] : cur.filter((x) => x !== r)))} className="size-4 accent-primary" />
                {tr(r)}
              </label>
            ))}
          </fieldset>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button disabled={busy || roles.length === 0} onClick={() => editing && run(() => setUserRoles(editing.id, roles, actorId), t("rolesSaved"))}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
