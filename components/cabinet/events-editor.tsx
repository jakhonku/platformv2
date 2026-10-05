"use client";

import { useState } from "react";
import { CalendarPlus, Trash2 } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/empty-state";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { addCollectiveEvent, removeCollectiveEvent } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import type { CollectiveEvent } from "@/types/collective";
import type { LocaleCode } from "@/types/common";

export function EventsEditor({ collectiveId, events }: { collectiveId: string; events: CollectiveEvent[] }) {
  const t = useTranslations("cabinetPage.collective");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const onAdd = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (title.trim().length < 2 || venue.trim().length < 2) return setError(t("errors.eventFields"));
    if (!date) return setError(t("errors.eventDate"));
    try {
      await addCollectiveEvent(collectiveId, { title, date: `${date}T18:00:00.000Z`, venue });
      toast.success(t("eventAdded"));
      setTitle("");
      setDate("");
      setVenue("");
      setError(null);
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  async function remove(id: string) {
    try {
      await removeCollectiveEvent(collectiveId, id);
      toast.success(t("eventRemoved"));
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    }
  }

  return (
    <Card className="gap-4 p-4">
      <h2 className="text-base font-semibold">{t("eventsTitle")}</h2>
      <form onSubmit={onAdd} noValidate className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-title">{t("eventTitle")}</Label>
          <Input id="ev-title" className="h-10" value={title} maxLength={150} onChange={(e) => (setTitle(e.target.value), setError(null))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-venue">{t("venue")}</Label>
          <Input id="ev-venue" className="h-10" value={venue} maxLength={150} onChange={(e) => (setVenue(e.target.value), setError(null))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-date">{t("date")}</Label>
          <Input id="ev-date" className="h-10" type="date" value={date} onChange={(e) => (setDate(e.target.value), setError(null))} />
        </div>
        <div className="flex items-end">
          <Button type="submit">
            <CalendarPlus aria-hidden />
            {t("addEvent")}
          </Button>
        </div>
      </form>
      <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
      {sorted.length === 0 ? (
        <EmptyState title={t("noEvents")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">{ev.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ev.date, locale)} · {ev.venue}
                </p>
              </div>
              <Button size="sm" variant="ghost" aria-label={t("removeEvent")} onClick={() => remove(ev.id)}>
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
