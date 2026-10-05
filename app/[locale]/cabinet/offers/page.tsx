import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { OffersList } from "@/components/cabinet/offers-list";
import { PageHeader } from "@/components/cabinet/page-header";
import { CollectiveInvitesList } from "@/components/cabinet/collective-invites-list";
import { getCollectiveInvitesFor, getInvitationsFor } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

const ROLES = ["musician", "vocalist", "conductor", "composer"] as const;

export default async function OffersPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.offers"), getDemoSubject()]);
  const [items, collectiveInvites] = subject.talent ? await Promise.all([getInvitationsFor(subject.talent.id), getCollectiveInvitesFor(subject.talent.id)]) : [[], []];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={ROLES}>
        <div className="flex flex-col gap-8">
          <CollectiveInvitesList items={collectiveInvites} />
          <OffersList items={items} />
        </div>
      </CabinetGuard>
    </div>
  );
}
