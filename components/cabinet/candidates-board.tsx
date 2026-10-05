"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { InviteDialog } from "@/components/talent/invite-dialog";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Link, useRouter } from "@/i18n/navigation";
import { updateApplicationStatus } from "@/lib/data/client";
import type { ApplicantView } from "@/lib/data";
import { talent as talentRoute } from "@/lib/routes";
import type { ApplicationStatus } from "@/types/opportunity";
import { APPLICATION_TONE } from "./application-status";
import { cn } from "@/lib/utils";

const STATUSES: ApplicationStatus[] = ["submitted", "viewed", "shortlisted", "invited", "accepted", "rejected"];
const DOT: Record<string, string> = { gray: "bg-neutral-400", blue: "bg-blue-500", yellow: "bg-amber-500", green: "bg-green-500", red: "bg-red-500" };

export function CandidatesBoard({ openings, selectedId, applicants }: { openings: { id: string; title: string }[]; selectedId: string; applicants: ApplicantView[] }) {
  const t = useTranslations("cabinetPage.candidates");
  const ts = useTranslations("cabinetPage.status");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, ApplicationStatus>>({});

  const rows = applicants.filter((a) => a.talent);
  const statusOf = (a: ApplicantView) => local[a.id] ?? a.status;

  async function change(a: ApplicantView, status: ApplicationStatus) {
    setLocal((s) => ({ ...s, [a.id]: status }));
    setPending(a.id);
    try {
      await updateApplicationStatus(a.id, status);
      toast.success(t("statusChanged"));
      router.refresh();
    } catch {
      setLocal((s) => {
        const rest = { ...s };
        delete rest[a.id];
        return rest;
      });
      toast.error(t("error"));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-xl flex-col gap-1.5">
        <label htmlFor="opening" className="text-sm font-medium">
          {t("opening")}
        </label>
        <NativeSelect id="opening" value={selectedId} onChange={(e) => router.push(`/cabinet/candidates?opening=${e.target.value}`)}>
          {openings.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </NativeSelect>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} text={t("emptyText")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STATUSES.map((s) => {
            const column = rows.filter((a) => statusOf(a) === s);
            return (
              <section key={s} aria-labelledby={`col-${s}`} className="flex min-w-0 flex-col gap-2 rounded-xl bg-muted/40 p-3">
                <h2 id={`col-${s}`} className="flex items-center gap-2 text-sm font-semibold">
                  <span className={cn("size-2 rounded-full", DOT[APPLICATION_TONE[s]])} aria-hidden />
                  {ts(s)} <span className="text-muted-foreground">({column.length})</span>
                </h2>
                {column.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : (
                  column.map((a) => (
                    <Card key={a.id} className="gap-2 p-3">
                      <Link href={talentRoute(a.talent!.kind, a.talent!.slug)} className="break-words text-sm font-semibold hover:underline">
                        {a.talent!.fullName}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{a.talent!.specialty}</p>
                      {a.message && <p className="line-clamp-3 break-words text-xs">{a.message}</p>}
                      <NativeSelect aria-label={t("changeStatus")} value={statusOf(a)} disabled={pending === a.id} onChange={(e) => change(a, e.target.value as ApplicationStatus)}>
                        {STATUSES.map((x) => (
                          <option key={x} value={x}>
                            {ts(x)}
                          </option>
                        ))}
                      </NativeSelect>
                      <InviteDialog talentId={a.talent!.id} talentName={a.talent!.fullName} />
                    </Card>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
