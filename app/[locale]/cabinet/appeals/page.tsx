import { getTranslations } from "next-intl/server";
import { AppealsManager } from "@/components/appeals/appeals-manager";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { getMyAppeals } from "@/lib/data";
import { APPEAL_KINDS } from "@/lib/data/appeals";
import { getDemoSubject } from "@/lib/demo/server";
import type { AppealKind } from "@/types/appeal";

const ROLES = ["member", "musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

/** Takliflar va murojaatlar: foydalanuvchi yozadi, platforma admini javob beradi */
export default async function AppealsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [t, subject, sp] = await Promise.all([getTranslations("appeals.user"), getDemoSubject(), searchParams]);
  const appeals = subject.userId ? await getMyAppeals(subject.userId) : [];
  const startKind = (APPEAL_KINDS as readonly string[]).includes(sp.new ?? "") ? (sp.new as AppealKind) : null;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {subject.userId ? <AppealsManager userId={subject.userId} role={subject.role} appeals={appeals} startKind={startKind} /> : null}
      </CabinetGuard>
    </div>
  );
}
