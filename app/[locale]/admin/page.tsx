import { Briefcase, ClipboardList, Eye, ShieldCheck, UserRound, Users, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/cabinet/page-header";
import { StatCard } from "@/components/cabinet/stat-card";
import { StatsChart } from "@/components/cabinet/stats-chart";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { canAccess } from "@/lib/admin-access";
import { getAdminStats, getAuditLog, getModerationQueue } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";

export default async function AdminPage() {
  const [t, role] = await Promise.all([getTranslations("adminPage.dashboard"), getDemoRole()]);
  const [stats, profiles, media, orgs, audit] = await Promise.all([
    getAdminStats(),
    getModerationQueue("profile"),
    getModerationQueue("media"),
    getModerationQueue("organization"),
    getAuditLog(1, 5),
  ]);
  const queues = [
    { key: "profiles" as const, count: profiles.length, href: "/admin/profiles" },
    { key: "media" as const, count: media.length, href: "/admin/media" },
    { key: "organizations" as const, count: orgs.length, href: "/admin/organizations" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("users")} value={stats.users} icon={Users} />
        <StatCard label={t("talents")} value={stats.talents} icon={UserRound} />
        <StatCard label={t("collectives")} value={stats.collectives} icon={UsersRound} />
        <StatCard label={t("organizations")} value={stats.organizations} icon={Briefcase} />
        <StatCard label={t("castingsOpen")} value={stats.castingsOpen} icon={ClipboardList} />
        <StatCard label={t("applications")} value={stats.applications} icon={ClipboardList} />
        <StatCard label={t("pending")} value={stats.pendingModeration} icon={ShieldCheck} />
        <StatCard label={t("views")} value={stats.monthlyViews.reduce((n, m) => n + m.views, 0)} icon={Eye} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <StatsChart monthly={stats.monthlyViews} />
        <Card className="gap-3 p-4">
          <h2 className="text-base font-semibold">{t("queues")}</h2>
          <ul className="flex flex-col gap-2">
            {queues.map((q) => (
              <li key={q.key} className="flex items-center justify-between gap-2 text-sm">
                {canAccess(role, q.key) ? (
                  <Link href={q.href} className="font-medium text-primary hover:underline">
                    {t(`queue.${q.key}`)}
                  </Link>
                ) : (
                  <span>{t(`queue.${q.key}`)}</span>
                )}
                <span className="tabular-nums text-muted-foreground">{q.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="gap-3 p-4">
        <h2 className="text-base font-semibold">{t("recentActivity")}</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {audit.items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 break-words">
                <span className="font-medium">{a.action}</span> · {a.details ?? a.entityId}
              </span>
              <span className="text-xs text-muted-foreground">{a.at.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
