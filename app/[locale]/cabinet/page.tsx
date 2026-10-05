import { Bell, Briefcase, CalendarDays, ClipboardList, Eye, Mail, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ApplicationStatusBadge } from "@/components/cabinet/application-status";
import { CabinetGuard } from "@/components/cabinet/cabinet-guard";
import { PageHeader } from "@/components/cabinet/page-header";
import { StatCard } from "@/components/cabinet/stat-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getApplicantsFor, getCastings, getCollectiveInvitesFor, getInvitationsFor, getMyApplications, getNotifications, getPortfolioStats, getVacancies } from "@/lib/data";
import { getDemoSubject } from "@/lib/demo/server";
import type { DemoSubject } from "@/lib/demo/subject";
import { casting as castingRoute, vacancy as vacancyRoute } from "@/lib/routes";

const DASHBOARD_ROLES = ["musician", "vocalist", "conductor", "composer", "collective", "organization"] as const;

async function TalentDashboard({ subject }: { subject: DemoSubject }) {
  const t = await getTranslations("cabinetPage.dashboard");
  const talentId = subject.talent!.id;
  const [stats, applications, offers, collectiveInvites, notifications] = await Promise.all([
    getPortfolioStats(talentId),
    getMyApplications(talentId),
    getInvitationsFor(talentId),
    getCollectiveInvitesFor(talentId),
    subject.userId ? getNotifications(subject.userId) : Promise.resolve([]),
  ]);
  const newOffers = offers.filter((o) => (o.status ?? "new") === "new").length + collectiveInvites.filter((i) => i.status === "pending").length;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("views")} value={stats.totalViews} icon={Eye} />
        <StatCard label={t("applications")} value={applications.length} icon={ClipboardList} />
        <StatCard label={t("newOffers")} value={newOffers} icon={Mail} />
        <StatCard label={t("unread")} value={unread} icon={Bell} />
      </div>
      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <h2 id="recent" className="text-base font-semibold">
          {t("recentApplications")}
        </h2>
        {applications.length === 0 ? (
          <EmptyState title={t("noApplications")} text={t("noApplicationsText")} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {applications.slice(0, 4).map((a) => (
              <Link key={a.id} href={a.targetKind === "casting" ? castingRoute(a.castingId!) : vacancyRoute(a.vacancyId!)} className="rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
                <Card className="gap-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold">{a.title}</p>
                    <ApplicationStatusBadge status={a.status} />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{a.organizationName}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

async function OrganizationDashboard({ subject }: { subject: DemoSubject }) {
  const t = await getTranslations("cabinetPage.dashboard");
  const orgId = subject.organization!.id;
  const [castings, vacancies] = await Promise.all([getCastings({ organizationId: orgId }, 1, 100), getVacancies({ organizationId: orgId }, 1, 100)]);
  const openings = [...castings.items, ...vacancies.items];
  const applicants = (await Promise.all(openings.map((o) => getApplicantsFor(o.id)))).flat();
  const open = openings.filter((o) => o.status === "open").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={t("openOpenings")} value={open} icon={Briefcase} />
      <StatCard label={t("totalOpenings")} value={openings.length} icon={ClipboardList} />
      <StatCard label={t("candidates")} value={applicants.length} icon={Users} />
      <StatCard label={t("newCandidates")} value={applicants.filter((a) => a.status === "submitted").length} icon={Mail} />
    </div>
  );
}

async function CollectiveDashboard({ subject }: { subject: DemoSubject }) {
  const t = await getTranslations("cabinetPage.dashboard");
  const collective = subject.collective!;
  const stats = await getPortfolioStats(collective.id);
  const now = new Date().toISOString();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={t("members")} value={collective.members.length} icon={Users} />
      <StatCard label={t("upcomingEvents")} value={collective.events.filter((e) => e.date >= now).length} icon={CalendarDays} />
      <StatCard label={t("views")} value={stats.totalViews} icon={Eye} />
    </div>
  );
}

export default async function CabinetPage() {
  const [t, subject] = await Promise.all([getTranslations("cabinetPage.dashboard"), getDemoSubject()]);
  const hasSubject = !!(subject.talent || subject.collective || subject.organization);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={subject.name ? t("welcome", { name: subject.name }) : undefined} />
      <CabinetGuard subject={subject} allow={DASHBOARD_ROLES}>
        {!hasSubject ? (
          <EmptyState title={t("noSubject")} />
        ) : subject.talent ? (
          <TalentDashboard subject={subject} />
        ) : subject.organization ? (
          <OrganizationDashboard subject={subject} />
        ) : (
          <CollectiveDashboard subject={subject} />
        )}
      </CabinetGuard>
    </div>
  );
}
