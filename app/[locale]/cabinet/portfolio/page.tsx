import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { PortfolioManager } from "@/components/cabinet/portfolio-manager";
import { getCollectionsForOwner, getMediaForOwner } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["musician", "vocalist", "conductor", "composer", "collective"] as const;

export default async function PortfolioPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.portfolio"), getDemoSubject()]);
  const owner = subject.talent ? { id: subject.talent.id, type: "talent" as const } : subject.collective ? { id: subject.collective.id, type: "collective" as const } : null;
  const [items, collections] = owner ? await Promise.all([getMediaForOwner(owner.id, { includeAll: true }), getCollectionsForOwner(owner.id)]) : [[], []];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        {owner && <PortfolioManager key={owner.id} ownerId={owner.id} ownerType={owner.type} items={items} collections={collections} />}
      </CabinetGuard>
    </div>
  );
}
