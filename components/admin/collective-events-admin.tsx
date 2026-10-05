"use client";

import { useState } from "react";
import { CalendarPlus, Trash2 } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useRouter } from "@/i18n/navigation";
import { addCollectiveEvent, removeCollectiveEvent } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import type { CollectiveEvent } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export type CollectiveEventsRow = { id: string; name: string; events: CollectiveEvent[] };

/** Jamoa tadbirlarini faqat platforma admini qo'shadi va o'chiradi */
export function CollectiveEventsAdmin({ collectives }: { collectives: CollectiveEventsRow[] }) {
  const t = useTranslations("adminPage.collectiveEvents");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [collectiveId, setCollectiveId] = useState(collectives[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const current = collectives.find((c) => c.id === collectiveId);
  const events = [...(current?.events ?? [])].sort((a, b) => a.date.localeCompare(b.date));

  const onAdd = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!collectiveId) return setError(t("errors.collective"));
    if (title.trim().length < 2 || venue.trim().length < 2) return setError(t("errors.fields"));
    if (!date) return setError(t("errors.date"));
    try {
      await addCollectiveEvent(collectiveId, { title, date: `${date}T18:00:00.000Z`, venue });
      toast.success(t("added"));
      setTitle("");
      setVenue("");
      setDate("");
      setError(null);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  async function remove(id: string) {
    try {
      await removeCollectiveEvent(collectiveId, id);
      toast.success(t("removed"));
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    }
  }

  if (collectives.length === 0) return null;

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("text")}</p>
      </div>
      <form onSubmit={onAdd} noValidate className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="ce-collective">{t("collective")}</Label>
          <NativeSelect id="ce-collective" value={collectiveId} onChange={(e) => setCollectiveId(e.target.value)}>
            {collectives.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ce-title">{t("eventTitle")}</Label>
          <Input id="ce-title" className="h-10" value={title} maxLength={150} onChange={(e) => (setTitle(e.target.value), setError(null))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ce-venue">{t("venue")}</Label>
          <Input id="ce-venue" className="h-10" value={venue} maxLength={150} onChange={(e) => (setVenue(e.target.value), setError(null))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ce-date">{t("date")}</Label>
          <Input id="ce-date" className="h-10" type="date" value={date} onChange={(e) => (setDate(e.target.value), setError(null))} />
        </div>
        <div className="flex items-end">
          <Button type="submit">
            <CalendarPlus aria-hidden /> {t("add")}
          </Button>
        </div>
      </form>
      <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
      {events.length > 0 && (
        <ul className="flex flex-col gap-2">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{ev.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ev.date, locale)} · {ev.venue}
                </p>
              </div>
              <Button size="sm" variant="ghost" aria-label={t("remove")} onClick={() => remove(ev.id)}>
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
