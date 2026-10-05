import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { CollectiveManager } from "@/components/cabinet/collective-manager";
import { EventsEditor } from "@/components/cabinet/events-editor";
import { MembersEditor } from "@/components/cabinet/members-editor";
import { MembersImport } from "@/components/cabinet/members-import";
import { PageHeader } from "@/components/cabinet/page-header";
import { PeopleList } from "@/components/cabinet/people-list";
import { getCollectiveDetailById, getCollectiveInvitesOf, getReferences, getTalents } from "@/lib/data";
import { localized } from "@/lib/localized";
import type { LocaleCode } from "@/types/common";
import { getLocale } from "next-intl/server";
import { getDemoSubject } from "@/lib/demo/server";

export default async function CollectivePage() {
  const [t, subject, locale, refs] = await Promise.all([getTranslations("cabinetPage.collective"), getDemoSubject(), getLocale() as Promise<LocaleCode>, getReferences()]);
  const detail = subject.collective ? await getCollectiveDetailById(subject.collective.id) : null;
  const [talents, rawInvites] = detail ? await Promise.all([getTalents({}, 1, 100).then((r) => r.items), getCollectiveInvitesOf(detail.id)]) : [[], []];
  const names = new Map(talents.map((x) => [x.id, x.fullName]));
  const invites = rawInvites.map((i) => ({ id: i.id, name: names.get(i.talentId) ?? i.talentId, section: i.section, status: i.status }));
  const pendingIds = new Set(rawInvites.filter((i) => i.status === "pending").map((i) => i.talentId));
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
            <CollectiveManager key={`about-${detail.id}`} collective={detail} regions={refs.regions.map((r) => ({ value: r.id, label: localized(r.name, locale) }))} />
            <MembersEditor collectiveId={detail.id} members={members} invites={invites} candidates={talents.filter((x) => !memberIds.has(x.id) && !pendingIds.has(x.id)).map((x) => ({ id: x.id, name: x.fullName }))} />
            <MembersImport kind="collective" targetId={detail.id} />
            {(detail.unregisteredMembers?.length ?? 0) > 0 && (
              <section aria-labelledby="unregistered" className="flex flex-col gap-3">
                <h2 id="unregistered" className="text-base font-semibold">
                  {t("unregisteredTitle", { count: detail.unregisteredMembers!.length })}
                </h2>
                <PeopleList rows={detail.unregisteredMembers!.map((m) => ({ id: m.id, name: m.name, phone: m.phone, note: m.section }))} noteLabel={t("section")} emptyTitle={t("noMembers")} />
              </section>
            )}
            <EventsEditor collectiveId={detail.id} events={detail.events} />
          </>
        )}
      </CabinetGuard>
    </div>
  );
}
