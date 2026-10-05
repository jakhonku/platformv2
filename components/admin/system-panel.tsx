"use client";

import { useState } from "react";
import { Download } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { createBackup, saveSystemSettings } from "@/lib/data/client";
import { formatDate } from "@/lib/format";
import type { SystemInfo, SystemSettings } from "@/types/admin";
import type { LocaleCode } from "@/types/common";

const TOGGLES = ["maintenanceMode", "allowRegistration", "moderationRequired"] as const;

export function SystemPanel({ info, settings, actorId }: { info: SystemInfo; settings: SystemSettings; actorId: string }) {
  const t = useTranslations("adminPage.system");
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [error, setError] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.supportEmail.trim())) return setError(t("errors.email"));
    try {
      await saveSystemSettings({ ...values, supportEmail: values.supportEmail.trim() }, actorId);
      setError(null);
      toast.success(t("saved"));
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  async function backup() {
    if (backingUp) return;
    setBackingUp(true);
    try {
      const { filename, json } = await createBackup(actorId);
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("backupDone"));
      router.refresh();
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setBackingUp(false);
    }
  }

  const stat = (label: string, value: string | number) => (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="gap-4 p-4">
        <h2 className="text-base font-semibold">{t("settingsTitle")}</h2>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {TOGGLES.map((k) => (
            <label key={k} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
              <input type="checkbox" checked={values[k]} onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.checked }))} className="mt-0.5 size-4 shrink-0 accent-primary" />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{t(`toggles.${k}`)}</span>
                <span className="text-xs text-muted-foreground">{t(`toggleHints.${k}`)}</span>
              </span>
            </label>
          ))}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sys-email">{t("supportEmail")}</Label>
            <Input id="sys-email" className="h-10" type="email" value={values.supportEmail} onChange={(e) => (setValues((v) => ({ ...v, supportEmail: e.target.value })), setError(null))} />
          </div>
          <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
          <Button type="submit" className="w-fit">
            {t("save")}
          </Button>
        </form>
      </Card>
      <Card className="gap-4 p-4">
        <h2 className="text-base font-semibold">{t("backupTitle")}</h2>
        <dl className="grid grid-cols-2 gap-3">
          {stat(t("version"), info.version)}
          {stat(t("users"), info.users)}
          {stat(t("talents"), info.talents)}
          {stat(t("media"), info.media)}
          {stat(t("lastBackup"), info.lastBackupAt ? `${formatDate(info.lastBackupAt, locale)} ${info.lastBackupAt.slice(11, 16)}` : t("never"))}
        </dl>
        <p className="text-sm text-muted-foreground">{t("backupText")}</p>
        <Button className="w-fit" disabled={backingUp} onClick={backup}>
          <Download aria-hidden />
          {t("backup")}
        </Button>
      </Card>
    </div>
  );
}
