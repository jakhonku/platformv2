import { AudioLinesFill, BuildingFill, MicFill, MusicFill, PenLineFill, SparklesFill, UsersFill, type Icon } from "@/components/icons";
import { AppIcon } from "@/components/ui/app-icon";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const CATEGORIES: { href: string; labelKey: string; icon: Icon }[] = [
  { href: "/musicians", labelKey: "musicians", icon: MusicFill },
  { href: "/vocalists", labelKey: "vocalists", icon: MicFill },
  { href: "/conductors", labelKey: "conductors", icon: SparklesFill },
  { href: "/composers", labelKey: "composers", icon: PenLineFill },
  { href: "/orchestras", labelKey: "orchestras", icon: UsersFill },
  { href: "/choirs", labelKey: "choirs", icon: AudioLinesFill },
  { href: "/organizations", labelKey: "organizations", icon: BuildingFill },
];

export async function CategoryGrid() {
  const t = await getTranslations();
  return (
    <section aria-labelledby="categories-title" className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 sm:px-6">
      <h2 id="categories-title" className="display text-2xl sm:text-3xl">
        {t("home.categoriesTitle")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map(({ href, labelKey, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col items-center gap-3 glass glass-hover rounded-3xl p-4 text-center focus-visible:outline-2 focus-visible:outline-ring"
            >
              <AppIcon icon={icon} size="lg" />
              <span className="text-sm font-medium text-balance">{t(`nav.${labelKey}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
