import { getTranslations } from "next-intl/server";
import { getCastings, getCollectives, getTalents } from "@/lib/data";
import { CountUp } from "./count-up";

/** Platforma raqamlari; ma'lumot olinmasa bo'lim jim yashiriladi */
export async function StatsStrip() {
  const [t, talents, collectives, castings] = await Promise.all([
    getTranslations("home"),
    getTalents({}, 1, 1).catch(() => null),
    getCollectives({}, 1, 1).catch(() => null),
    getCastings({}, 1, 1).catch(() => null),
  ]);
  if (!talents || !collectives || !castings) return null;

  const stats = [
    { value: talents.total, label: t("statsTalents") },
    { value: collectives.total, label: t("statsCollectives") },
    { value: castings.total, label: t("statsCastings") },
  ];
  return (
    <section className="mx-auto w-full max-w-4xl px-3 sm:px-6">
      <dl className="glass-strong grid grid-cols-3 divide-x divide-foreground/10 rounded-[2rem] py-5 text-center sm:py-7">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 px-2">
            <dd className="display order-1 text-3xl text-foreground sm:text-5xl">
              <CountUp value={s.value} />
            </dd>
            <dt className="order-2 text-xs text-foreground/60 sm:text-sm">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
