"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LocaleCode } from "@/types/common";

/** Qisqa oy nomlari: Intl/ICU farqlariga bog'liq emas (server va brauzerda bir xil) */
const MONTHS: Record<LocaleCode, string[]> = {
  uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
  ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

type Period = "weekly" | "monthly";
type Point = { key: string; label: string; full: string; views: number };

/** Ko'rishlar grafigi: haftalik (oxirgi 12 hafta) va oylik (oxirgi 12 oy) ko'rinish */
export function StatsChart({ monthly, weekly }: { monthly: { month: string; views: number }[]; weekly: { week: string; views: number }[] }) {
  const t = useTranslations("cabinetPage.stats");
  const locale = useLocale() as LocaleCode;
  const [period, setPeriod] = useState<Period>("weekly");

  const series: Point[] =
    period === "weekly"
      ? weekly.map((w) => {
          const [y, m, d] = w.week.split("-");
          return { key: w.week, label: `${d}.${m}`, full: t("weekOf", { date: `${d}.${m}.${y}` }), views: w.views };
        })
      : monthly.map((m) => {
          const [y, mo] = m.month.split("-");
          const name = MONTHS[locale][Number(mo) - 1];
          return { key: m.month, label: name, full: `${name} ${y}`, views: m.views };
        });

  const total = series.reduce((n, p) => n + p.views, 0);
  const last = series.at(-1)?.views ?? 0;
  const prev = series.at(-2)?.views ?? 0;
  const delta = prev > 0 ? Math.round(((last - prev) / prev) * 100) : null;
  const title = period === "weekly" ? t("chartTitleWeekly") : t("chartTitle");

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            <span>
              {t("periodTotal")}: <strong className="font-semibold text-foreground tabular-nums">{total}</strong>
            </span>
            {delta !== null && (
              <span className={cn("tabular-nums", delta >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% {t(period === "weekly" ? "vsPrevWeek" : "vsPrevMonth")}
              </span>
            )}
          </p>
        </div>
        <div role="tablist" aria-label={t("period")} className="inline-flex rounded-full border p-0.5">
          {(["weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn("h-8 rounded-full px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50", period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {t(p === "weekly" ? "periodWeekly" : "periodMonthly")}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval={0} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} width={52} />
            <Tooltip formatter={(v) => [String(v), t("views")]} labelFormatter={(_, p) => String(p?.[0]?.payload?.full ?? "")} />
            <Area type="monotone" dataKey="views" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
