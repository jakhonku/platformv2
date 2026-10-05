"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "@/components/icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useRouter } from "@/i18n/navigation";
import { inviteCollectiveMember, removeCollectiveMember } from "@/lib/data/client";
import { DataError } from "@/lib/data/errors";

type Member = { talentId: string; name: string; section: string };
type Invite = { id: string; name: string; section: string; status: "pending" | "accepted" | "declined" };

export function MembersEditor({ collectiveId, members, invites, candidates }: { collectiveId: string; members: Member[]; invites: Invite[]; candidates: { id: string; name: string }[] }) {
  const t = useTranslations("cabinetPage.collective");
  const router = useRouter();
  const [talentId, setTalentId] = useState("");
  const [section, setSection] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);

  const onAdd = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!talentId) return setError(t("errors.pickTalent"));
    if (!section.trim()) return setError(t("errors.section"));
    try {
      await inviteCollectiveMember(collectiveId, { talentId, section });
      toast.success(t("inviteSent"));
      setTalentId("");
      setSection("");
      setError(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof DataError && err.code === "duplicate" ? t("errors.duplicate") : t("errors.generic"));
    }
  });

  async function remove() {
    if (!removing || busy) return;
    setBusy(true);
    try {
      await removeCollectiveMember(collectiveId, removing.talentId);
      toast.success(t("memberRemoved"));
      setRemoving(null);
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="gap-4 p-4">
      <h2 className="text-base font-semibold">{t("membersTitle")}</h2>
      <form onSubmit={onAdd} noValidate className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="m-talent">{t("talent")}</Label>
          <NativeSelect id="m-talent" value={talentId} onChange={(e) => (setTalentId(e.target.value), setError(null))}>
            <option value="">—</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="m-section">{t("section")}</Label>
          <Input id="m-section" className="h-9" value={section} maxLength={60} onChange={(e) => (setSection(e.target.value), setError(null))} />
        </div>
        <Button type="submit">
          <UserPlus aria-hidden />
          {t("inviteMember")}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">{t("inviteNote")}</p>
      <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
      {invites.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("invitesTitle")}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl border border-dashed p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.section}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">{t(`inviteStatus.${i.status}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {members.length === 0 ? (
        <EmptyState title={t("noMembers")} />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {members.map((m) => (
            <li key={m.talentId} className="flex items-center justify-between gap-2 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.section}</p>
              </div>
              <Button size="sm" variant="ghost" aria-label={t("removeMember")} onClick={() => setRemoving(m)}>
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("removeMember")}</DialogTitle>
            <DialogDescription>{t("removeMemberText", { name: removing?.name ?? "" })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {t("remove")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
