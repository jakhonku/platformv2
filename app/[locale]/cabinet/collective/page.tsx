import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { CollectiveManager } from "@/components/cabinet/collective-manager";
import { EventsEditor } from "@/components/cabinet/events-editor";
import { MembersEditor } from "@/components/cabinet/members-editor";
import { PageHeader } from "@/components/cabinet/page-header";
import { getCollectiveBySlug, getTalents } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

export default async function CollectivePage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.collective"), getDemoSubject()]);
  const detail = subject.collective ? await getCollectiveBySlug(subject.collective.slug) : null;
  const talents = detail ? (await getTalents({}, 1, 100)).items : [];
  const memberIds = new Set(detail?.members.map((m) => m.talentId));
  const members = (detail?.members ?? []).flatMap((m) => {
    const profile = detail?.memberProfiles.find((p) => p.id === m.talentId);
    return profile ? [{ talentId: m.talentId, name: profile.fullName, section: m.section }] : [];
  });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={detail ? detail.name : undefined} />
      <CabinetGuard subject={subject} allow={["collective"]}>
        {detail && (
          <>
            <CollectiveManager key={`about-${detail.id}`} collective={detail} />
            <MembersEditor collectiveId={detail.id} members={members} candidates={talents.filter((x) => !memberIds.has(x.id)).map((x) => ({ id: x.id, name: x.fullName }))} />
            <EventsEditor collectiveId={detail.id} events={detail.events} />
          </>
        )}
      </CabinetGuard>
    </div>
  );
}
