"use client";

import { Printer } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Appeal } from "@/types/appeal";
import { AppealKindBadge, AppealStatusBadge } from "./appeal-badges";
import { AppealThread, AttachmentList, formatDateTime } from "./appeal-thread";

const DOT: Record<string, string> = { created: "bg-primary", opened: "bg-blue-500", followup: "bg-muted-foreground", answered: "bg-green-500", returned: "bg-red-500", resubmitted: "bg-amber-500", closed: "bg-neutral-400", reopened: "bg-blue-500" };

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{children}</dd>
    </div>
  );
}

/** Rasmiy xat ko'rinishi: raqam, tomonlar, sana, mavzu, matn, PDF ilovalar, harakatlar tarixi va yozishma */
export function LetterView({ appeal, viewer }: { appeal: Appeal; viewer: "user" | "admin" }) {
  const t = useTranslations("appeals.letter");
  const te = useTranslations("appeals.event");
  const tr = useTranslations("roles");
  const [first, ...rest] = appeal.messages;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-5 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{t("number")}</p>
            <p className="font-mono text-xl font-semibold tracking-wide">{appeal.number}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AppealKindBadge kind={appeal.kind} />
            <AppealStatusBadge status={appeal.status} />
            <Button type="button" variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
              <Printer aria-hidden /> {t("print")}
            </Button>
          </div>
        </div>

        <dl className="grid gap-4 border-y py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label={t("from")}>
            {appeal.authorName} · {tr(appeal.authorRole)}
          </Meta>
          <Meta label={t("to")}>{t("toValue")}</Meta>
          <Meta label={t("date")}>{formatDateTime(appeal.createdAt)}</Meta>
          <Meta label={appeal.status === "new" ? t("queue") : t("opened")}>
            {appeal.status === "new" ? t("queueValue", { n: appeal.queuePosition ?? 1 }) : appeal.openedAt ? formatDateTime(appeal.openedAt) : t("notOpened")}
          </Meta>
        </dl>

        {appeal.status === "returned" && appeal.returnReason && (
          <div role="status" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-300">
            <p className="font-medium">{t("returnedTitle")}</p>
            <p className="break-words">{t("returnedText", { reason: appeal.returnReason })}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold break-words">{appeal.subject}</h2>
          <p className={cn("text-sm leading-relaxed break-words whitespace-pre-line", !first.text && "text-muted-foreground")}>{first.text || t("noText")}</p>
          {first.attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">{t("attachments")}</p>
              <AttachmentList appealId={appeal.id} attachments={first.attachments} />
            </div>
          )}
        </div>
      </Card>

      <Card className="gap-3 p-5 sm:p-6">
        <h2 className="text-base font-semibold">{t("history")}</h2>
        <ol className="flex flex-col gap-0">
          {appeal.events.map((e, i) => (
            <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < appeal.events.length - 1 && <span aria-hidden className="absolute top-3 bottom-0 left-[5px] w-px bg-border" />}
              <span aria-hidden className={cn("relative mt-1.5 size-[11px] shrink-0 rounded-full", DOT[e.type] ?? "bg-primary")} />
              <div className="flex min-w-0 flex-col">
                <p className="text-sm font-medium">{te(e.type)}</p>
                <p className="text-xs text-muted-foreground">
                  {e.actorName} · {formatDateTime(e.at)}
                </p>
                {e.note && <p className="text-sm break-words text-muted-foreground">{e.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {rest.length > 0 && (
        <Card className="gap-4 p-5 sm:p-6">
          <h2 className="text-base font-semibold">{t("correspondence")}</h2>
          <AppealThread appealId={appeal.id} messages={rest} viewer={viewer} />
        </Card>
      )}
    </div>
  );
}
