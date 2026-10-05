"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveNotificationSettings } from "@/lib/data";
import type { NotificationChannel } from "@/types/system";

const CHANNELS: NotificationChannel[] = ["internal", "email", "sms", "telegram"];

export function NotificationSettings({ settingsKey, initial }: { settingsKey: string; initial: Record<NotificationChannel, boolean> }) {
  const t = useTranslations("cabinetPage.settings");
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await saveNotificationSettings(settingsKey, values);
      toast.success(t("saved"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{t("legend")}</legend>
        {CHANNELS.map((c) => (
          <label key={c} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
            <input
              type="checkbox"
              checked={values[c]}
              onChange={(e) => setValues((v) => ({ ...v, [c]: e.target.checked }))}
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">{t(`channels.${c}`)}</span>
              <span className="text-xs text-muted-foreground">{t(`channelHints.${c}`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <Button type="submit" className="w-fit" disabled={saving}>
        {saving ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
