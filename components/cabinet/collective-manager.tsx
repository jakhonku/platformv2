"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSingleSubmit } from "@/components/layout/use-single-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { updateCollective } from "@/lib/data/client";
import type { Collective } from "@/types/collective";

const CONTACT_KEYS = ["phone", "email", "telegram", "website"] as const;

/** Jamoa sahifasi: tavsif, repertuar va kontaktlar */
export function CollectiveManager({ collective, regions }: { collective: Collective; regions: { value: string; label: string }[] }) {
  const t = useTranslations("cabinetPage.collective");
  const router = useRouter();
  const [description, setDescription] = useState(collective.description);
  const [repertoire, setRepertoire] = useState(collective.repertoire.join("\n"));
  const [city, setCity] = useState(collective.city);
  const [regionId, setRegionId] = useState(collective.regionId);
  const [contacts, setContacts] = useState({ phone: collective.contacts.phone ?? "", email: collective.contacts.email ?? "", telegram: collective.contacts.telegram ?? "", website: collective.contacts.website ?? "" });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) return setError(t("errors.description"));
    if (!city.trim()) return setError(t("errors.city"));
    if (contacts.website.trim() && !/^https?:\/\//i.test(contacts.website.trim())) return setError(t("errors.website"));
    try {
      await updateCollective(collective.id, {
        description,
        city,
        regionId,
        repertoire: repertoire.split("\n").map((x) => x.trim()).filter(Boolean),
        contacts: Object.fromEntries(CONTACT_KEYS.map((k) => [k, contacts[k].trim() || undefined])),
      });
      setError(null);
      toast.success(t("saved"));
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">{t("aboutTitle")}</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-about">{t("description")}</Label>
          <Textarea id="col-about" rows={5} maxLength={3000} value={description} onChange={(e) => (setDescription(e.target.value), setError(null))} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="col-region">{t("region")}</Label>
            <NativeSelect id="col-region" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              {regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="col-city">{t("city")}</Label>
            <Input id="col-city" className="h-10" value={city} maxLength={80} onChange={(e) => (setCity(e.target.value), setError(null))} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="col-rep">{t("repertoire")}</Label>
          <Textarea id="col-rep" rows={5} value={repertoire} onChange={(e) => setRepertoire(e.target.value)} />
          <p className="text-xs text-muted-foreground">{t("repertoireHint")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTACT_KEYS.map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <Label htmlFor={`col-${k}`}>{t(`contact.${k}`)}</Label>
              <Input id={`col-${k}`} className="h-10" value={contacts[k]} onChange={(e) => (setContacts((c) => ({ ...c, [k]: e.target.value })), setError(null))} />
            </div>
          ))}
        </div>
        <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>
        <Button type="submit" className="w-fit">
          {t("save")}
        </Button>
      </form>
    </Card>
  );
}
