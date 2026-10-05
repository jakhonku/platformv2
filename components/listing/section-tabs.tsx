import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { listingHref, type ListingKey } from "@/lib/listing-keys";
import { cn } from "@/lib/utils";

const GROUPS: Record<"opportunities" | "events", ListingKey[]> = {
  opportunities: ["castings", "vacancies"],
  events: ["competitions", "festivals"],
};

export function SectionTabs({ group, active }: { group: "opportunities" | "events"; active: ListingKey }) {
  const t = useTranslations("nav");
  return (
    <nav aria-label={t(active)} className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5">
        {GROUPS[group].map((key) => (
          <li key={key}>
            <Link
              href={listingHref(key)}
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
