import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { MembersImport } from "@/components/cabinet/members-import";
import { PageHeader } from "@/components/cabinet/page-header";
import { PeopleList } from "@/components/cabinet/people-list";
import { getDemoSubject } from "@/lib/demo/server";

export default async function StaffPage() {
  const [t, ti, subject] = await Promise.all([getTranslations("cabinetPage.staff"), getTranslations("cabinetPage.import"), getDemoSubject()]);
  const org = subject.organization;
  const rows = (org?.staff ?? []).map((s) => ({ id: s.id, name: s.name, phone: s.phone, note: s.position, linked: !!s.talentId }));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={["organization"]}>
        {org && (
          <>
            <MembersImport kind="organization" targetId={org.id} />
            <section aria-labelledby="staff-list" className="flex flex-col gap-3">
              <h2 id="staff-list" className="text-base font-semibold">
                {t("listTitle", { count: rows.length })}
              </h2>
              <PeopleList rows={rows} noteLabel={ti("list.position")} emptyTitle={t("empty")} />
            </section>
          </>
        )}
      </CabinetGuard>
    </div>
  );
}
