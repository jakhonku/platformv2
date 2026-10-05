"use client";

import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { LocaleCode } from "@/types/common";

export function StatsChart({ monthly }: { monthly: { month: string; views: number }[] }) {
  const t = useTranslations("cabinetPage.stats");
  const locale = useLocale() as LocaleCode;
  const label = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
  const data = monthly.map((m) => ({ ...m, label: label(m.month) }));

  return (
    <Card className="gap-3 p-4">
      <h2 className="text-base font-semibold">{t("chartTitle")}</h2>
      <div className="h-64 w-full" role="img" aria-label={t("chartTitle")}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" />
            <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} width={48} />
            <Tooltip formatter={(v) => [String(v), t("views")]} labelFormatter={(_, p) => String(p?.[0]?.payload?.month ?? "")} />
            <Area type="monotone" dataKey="views" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
