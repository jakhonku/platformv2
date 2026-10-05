import { ArrowRight } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export function SectionHeader({ id, title, href, hrefLabel }: { id: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="display text-2xl sm:text-3xl">
        {title}
      </h2>
      {href && hrefLabel && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
          {hrefLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
