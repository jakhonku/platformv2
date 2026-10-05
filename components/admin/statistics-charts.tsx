"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatsChart } from "@/components/cabinet/stats-chart";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";

type Point = { label: string; value: number };

/** Sayt uslubiga mos klassik palitra: to'q ko'k, oltin, shalfey, g'isht, tosh, qum, osmon, binafsha-kulrang */
const PALETTE = ["#1f3a5f", "#c9a45c", "#6b8f71", "#b86a4b", "#6c7a89", "#a99a7c", "#4a6fa5", "#8c5a7a"];

const empty = (data: Point[]) => data.every((d) => d.value === 0);

function BarCard({ title, data, horizontal, height }: { title: string; data: Point[]; horizontal?: boolean; height?: number }) {
  const t = useTranslations("adminPage.statistics");
  const h = height ?? (horizontal ? Math.max(256, data.length * 34 + 24) : 256);
  return (
    <Card className="gap-3 p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {empty(data) ? (
        <EmptyState title={t("noData")} />
      ) : (
        <div className="w-full" style={{ height: h }} role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            {horizontal ? (
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} fontSize={12} interval={0} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval={0} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function DonutCard({ title, data }: { title: string; data: Point[] }) {
  const t = useTranslations("adminPage.statistics");
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <Card className="gap-3 p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {total === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-40 shrink-0" role="img" aria-label={title}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={74} paddingAngle={2} stroke="none">
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums">{total}</span>
              <span className="text-[0.65rem] text-muted-foreground uppercase">{t("total")}</span>
            </div>
          </div>
          <ul className="flex w-full min-w-0 flex-col gap-1.5">
            {data.map((d, i) => (
              <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden />
                  <span className="truncate">{d.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {d.value} · {Math.round((d.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export type StatisticsData = {
  kpis: { label: string; value: string; hint?: string }[];
  kinds: Point[];
  availability: Point[];
  accounts: Point[];
  ages: Point[];
  experience: Point[];
  instruments: Point[];
  voices: Point[];
  regions: Point[];
  collectives: Point[];
  organizations: Point[];
  openings: Point[];
  statuses: Point[];
  appeals: Point[];
  monthly: { month: string; views: number }[];
  weekly: { week: string; views: number }[];
};

export function StatisticsCharts({ data }: { data: StatisticsData }) {
  const t = useTranslations("adminPage.statistics");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </div>
      <StatsChart monthly={data.monthly} weekly={data.weekly} />

      <div className="grid gap-4 lg:grid-cols-3">
        <DonutCard title={t("talentsByKind")} data={data.kinds} />
        <DonutCard title={t("byAvailability")} data={data.availability} />
        <DonutCard title={t("accounts")} data={data.accounts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarCard title={t("byAge")} data={data.ages} />
        <BarCard title={t("byExperience")} data={data.experience} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarCard title={t("byInstrument")} data={data.instruments} horizontal />
        <BarCard title={t("topRegions")} data={data.regions} horizontal />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BarCard title={t("byVoice")} data={data.voices} horizontal />
        <DonutCard title={t("collectivesByType")} data={data.collectives} />
        <BarCard title={t("organizationsByKind")} data={data.organizations} horizontal />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BarCard title={t("openings")} data={data.openings} horizontal />
        <BarCard title={t("applicationsByStatus")} data={data.statuses} horizontal />
        <BarCard title={t("appeals")} data={data.appeals} horizontal />
      </div>
    </div>
  );
}
