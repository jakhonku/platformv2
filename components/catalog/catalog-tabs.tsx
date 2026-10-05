import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATALOG_KEYS, catalogHref, type CatalogKey } from "@/lib/catalog-keys";
import { cn } from "@/lib/utils";

export function CatalogTabs({ active }: { active: CatalogKey }) {
  const t = useTranslations("catalog.title");
  return (
    <nav aria-label={t(active)} className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5">
        {CATALOG_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={catalogHref(key)}
              aria-current={key === active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                key === active ? "border-transparent bg-primary text-primary-foreground shadow-sm" : "glass border-(--glass-border) text-foreground/70 hover:bg-(--glass-hover) hover:text-foreground",
              )}
            >
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
