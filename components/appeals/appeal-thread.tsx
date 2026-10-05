"use client";

import { Paperclip } from "@/components/icons";
import { useTranslations } from "next-intl";
import { formatFileSize } from "@/lib/appeal-files";
import { cn } from "@/lib/utils";
import type { AppealAttachment, AppealMessage } from "@/types/appeal";

const PARTS = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** DD.MM.YYYY HH:mm (Toshkent vaqti): barcha tillarda va server/brauzerda bir xil (gidratatsiya mos) */
export function formatDateTime(iso: string): string {
  const p = Object.fromEntries(PARTS.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}`;
}

/** PDF ilovalar ro'yxati: ochish va yuklab olish havolalari */
export function AttachmentList({ appealId, attachments }: { appealId: string; attachments: AppealAttachment[] }) {
  const t = useTranslations("appeals.letter");
  if (attachments.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1.5">
      {attachments.map((f) => (
        <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate font-medium">{f.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(f.size)}</span>
          </span>
          <span className="flex gap-3 text-xs print:hidden">
            <a href={`/api/appeals/${appealId}/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              {t("open")}
            </a>
            <a href={`/api/appeals/${appealId}/files/${f.id}?download=1`} className="font-medium text-primary hover:underline">
              {t("download")}
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Yozishma: foydalanuvchi xabarlari bir tomonda, admin javobi ikkinchi tomonda */
export function AppealThread({ appealId, messages, viewer }: { appealId: string; messages: AppealMessage[]; viewer: "user" | "admin" }) {
  const t = useTranslations("appeals.letter");
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((m) => {
        const mine = m.from === viewer;
        return (
          <li key={m.id} className={cn("flex flex-col gap-1.5", mine ? "items-end" : "items-start")}>
            <div className={cn("flex max-w-[92%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm break-words sm:max-w-[80%]", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground")}>
              <span className="whitespace-pre-line">{m.text || t("noText")}</span>
            </div>
            {m.attachments.length > 0 && (
              <div className="w-full max-w-[92%] sm:max-w-[80%]">
                <AttachmentList appealId={appealId} attachments={m.attachments} />
              </div>
            )}
            <span className="px-1 text-xs text-muted-foreground">
              {m.authorName} · {formatDateTime(m.at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
