import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Brand } from "./brand";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

type Column = { titleKey: string; links: { href: string; labelKey: string }[] };

const COLUMNS: Column[] = [
  {
    titleKey: "nav.catalogs",
    links: [
      { href: "/musicians", labelKey: "nav.musicians" },
      { href: "/vocalists", labelKey: "nav.vocalists" },
      { href: "/conductors", labelKey: "nav.conductors" },
      { href: "/composers", labelKey: "nav.composers" },
      { href: "/orchestras", labelKey: "nav.orchestras" },
      { href: "/choirs", labelKey: "nav.choirs" },
      { href: "/organizations", labelKey: "nav.organizations" },
    ],
  },
  {
    titleKey: "footer.opportunities",
    links: [
      { href: "/castings", labelKey: "nav.castings" },
      { href: "/vacancies", labelKey: "nav.vacancies" },
      { href: "/competitions", labelKey: "nav.competitions" },
      { href: "/festivals", labelKey: "nav.festivals" },
    ],
  },
  {
    titleKey: "footer.platform",
    links: [
      { href: "/projects", labelKey: "nav.projects" },
      { href: "/news", labelKey: "nav.news" },
      { href: "/education", labelKey: "nav.education" },
      { href: "/cabinet/appeals", labelKey: "appeals.footerLink" },
    ],
  },
];

export async function PublicFooter() {
  const t = await getTranslations();
  return (
    <footer className="px-3 pt-8 pb-28 sm:px-6 lg:pb-6">
      <div className="glass-strong mx-auto w-full max-w-7xl rounded-[2rem] p-6 sm:p-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-x-10">
          <div className="col-span-2 flex flex-col items-start gap-5 lg:col-span-1">
            <Brand />
            <p className="max-w-xs text-sm leading-relaxed text-foreground/65">{t("app.description")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button nativeButton={false} className="h-10 rounded-full px-5" render={<Link href="/register" />}>
                {t("nav.register")}
              </Button>
              <Button nativeButton={false} variant="ghost" className="h-10 rounded-full px-4" render={<Link href="/login" />}>
                {t("nav.login")}
              </Button>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.titleKey} aria-labelledby={`footer-${col.titleKey}`} className="flex flex-col gap-4">
              <h2 id={`footer-${col.titleKey}`} className="text-xs font-semibold tracking-[0.14em] text-foreground/50 uppercase">
                {t(col.titleKey)}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-block text-sm text-foreground/75 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-foreground">
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground/55">
            © {new Date().getFullYear()} {t("app.shortName")}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
