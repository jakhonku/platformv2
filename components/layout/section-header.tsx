import { ArrowRight } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export function SectionHeader({ id, title, href, hrefLabel }: { id: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {href && hrefLabel && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
          {hrefLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
