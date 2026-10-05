import { getTranslations } from "next-intl/server";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { CandidatesBoard } from "@/components/cabinet/candidates-board";
import { PageHeader } from "@/components/cabinet/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { getApplicantsFor, getCastings, getVacancies } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [t, subject, raw] = await Promise.all([getTranslations("cabinetPage.candidates"), getDemoSubject(), searchParams]);
  const org = subject.organization;
  const [castings, vacancies] = org ? await Promise.all([getCastings({ organizationId: org.id }, 1, 100), getVacancies({ organizationId: org.id }, 1, 100)]) : [null, null];
  const openings = [...(castings?.items ?? []), ...(vacancies?.items ?? [])].map((o) => ({ id: o.id, title: o.title }));
  const asked = Array.isArray(raw.opening) ? raw.opening[0] : raw.opening;
  const selected = openings.find((o) => o.id === asked) ?? openings[0];
  const applicants = selected ? await getApplicantsFor(selected.id) : [];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CabinetGuard subject={subject} allow={["organization"]}>
        {selected ? <CandidatesBoard key={selected.id} openings={openings} selectedId={selected.id} applicants={applicants} /> : <EmptyState title={t("noOpenings")} text={t("noOpeningsText")} />}
      </CabinetGuard>
    </div>
  );
}
