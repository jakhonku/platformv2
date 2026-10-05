import { getLocale, getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { ProfileWizard } from "@/components/cabinet/profile-wizard";
import { getReferences } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";

const ROLES = ["musician", "vocalist", "conductor", "composer"] as const;

export default async function ProfilePage() {
  const [t, subject, locale, refs] = await Promise.all([getTranslations("cabinetPage.profile"), getDemoSubject(), getLocale() as Promise<LocaleCode>, getReferences()]);
  const opt = (list: { id: string; name: Record<LocaleCode, string> }[]) => list.map((x) => ({ value: x.id, label: localized(x.name, locale) }));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {subject.talent && <ProfileWizard key={subject.talent.id} talent={subject.talent} regions={opt(refs.regions)} instruments={opt(refs.instruments)} voiceTypes={opt(refs.voiceTypes)} />}
      </CabinetGuard>
    </div>
  );
}
