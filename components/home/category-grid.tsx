import { AudioLines, Building2, Mic, Music, PenLine, Sparkles, Users, type Icon } from "@/components/icons";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const CATEGORIES: { href: string; labelKey: string; icon: Icon }[] = [
  { href: "/musicians", labelKey: "musicians", icon: Music },
  { href: "/vocalists", labelKey: "vocalists", icon: Mic },
  { href: "/conductors", labelKey: "conductors", icon: Sparkles },
  { href: "/composers", labelKey: "composers", icon: PenLine },
  { href: "/orchestras", labelKey: "orchestras", icon: Users },
  { href: "/choirs", labelKey: "choirs", icon: AudioLines },
  { href: "/organizations", labelKey: "organizations", icon: Building2 },
];

export async function CategoryGrid() {
  const t = await getTranslations();
  return (
    <section aria-labelledby="categories-title" className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 sm:px-6">
      <h2 id="categories-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
        {t("home.categoriesTitle")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map(({ href, labelKey, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-medium">{t(`nav.${labelKey}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
