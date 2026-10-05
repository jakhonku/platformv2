"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatsChart } from "@/components/cabinet/stats-chart";
import { EmptyState } from "@/components/layout/empty-state";
import { Card } from "@/components/ui/card";

type Point = { label: string; value: number };

function BarCard({ title, data, horizontal }: { title: string; data: Point[]; horizontal?: boolean }) {
  const t = useTranslations("adminPage.statistics");
  return (
    <Card className="gap-3 p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {data.every((d) => d.value === 0) ? (
        <EmptyState title={t("noData")} />
      ) : (
        <div className="h-64 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            {horizontal ? (
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="label" width={96} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval={0} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function StatisticsCharts({ kinds, statuses, regions, monthly }: { kinds: Point[]; statuses: Point[]; regions: Point[]; monthly: { month: string; views: number }[] }) {
  const t = useTranslations("adminPage.statistics");
  return (
    <div className="flex flex-col gap-4">
      <StatsChart monthly={monthly} />
      <div className="grid gap-4 lg:grid-cols-2">
        <BarCard title={t("talentsByKind")} data={kinds} />
        <BarCard title={t("applicationsByStatus")} data={statuses} />
      </div>
      <BarCard title={t("topRegions")} data={regions} horizontal />
    </div>
  );
}
