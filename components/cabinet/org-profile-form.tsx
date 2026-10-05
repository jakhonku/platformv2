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
import { updateOrganization } from "@/lib/data/client";
import type { Organization } from "@/types/collective";

const CONTACT_KEYS = ["phone", "email", "telegram", "website"] as const;

/** Tashkilot ma`lumotlari: moderator tasdiqlashi uchun tavsif, shahar, hudud va telefon to`liq bo`lishi kerak */
export function OrgProfileForm({ organization, regions }: { organization: Organization; regions: { value: string; label: string }[] }) {
  const t = useTranslations("cabinetPage.orgProfile");
  const router = useRouter();
  const [description, setDescription] = useState(organization.description);
  const [city, setCity] = useState(organization.city);
  const [regionId, setRegionId] = useState(organization.regionId);
  const [contacts, setContacts] = useState({ phone: organization.contacts.phone ?? "", email: organization.contacts.email ?? "", telegram: organization.contacts.telegram ?? "", website: organization.contacts.website ?? "" });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useSingleSubmit(async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) return setError(t("errors.description"));
    if (!city.trim()) return setError(t("errors.city"));
    if (contacts.website.trim() && !/^https?:\/\//i.test(contacts.website.trim())) return setError(t("errors.website"));
    try {
      await updateOrganization(organization.id, { description, city, regionId, contacts: Object.fromEntries(CONTACT_KEYS.map((k) => [k, contacts[k].trim() || undefined])) });
      setError(null);
      toast.success(t("saved"));
      router.refresh();
    } catch {
      setError(t("errors.generic"));
    }
  });

  return (
    <Card className="max-w-3xl p-4 sm:p-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">{t("editTitle")}</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-desc">{t("description")}</Label>
          <Textarea id="org-desc" rows={5} maxLength={3000} value={description} onChange={(e) => (setDescription(e.target.value), setError(null))} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-region">{t("region")}</Label>
            <NativeSelect id="org-region" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              {regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-city">{t("city")}</Label>
            <Input id="org-city" className="h-10" value={city} maxLength={80} onChange={(e) => (setCity(e.target.value), setError(null))} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTACT_KEYS.map((k) => (
            <div key={k} className="flex flex-col gap-1.5">
              <Label htmlFor={`org-${k}`}>{t(`contact.${k}`)}</Label>
              <Input id={`org-${k}`} className="h-10" value={contacts[k]} onChange={(e) => (setContacts((c) => ({ ...c, [k]: e.target.value })), setError(null))} />
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
