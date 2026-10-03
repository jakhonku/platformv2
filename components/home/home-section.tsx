import { SectionHeader } from "@/components/layout/section-header";
import { SectionBoundary } from "./section-boundary";

/** Bosh sahifa bo'limi: sarlavha darhol, kontent Suspense + xato chegarasi ichida oqim bilan keladi */
export function HomeSection({
  id,
  title,
  href,
  hrefLabel,
  fallback,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 sm:px-6">
      <SectionHeader id={id} title={title} href={href} hrefLabel={hrefLabel} />
      <SectionBoundary fallback={fallback}>{children}</SectionBoundary>
    </section>
  );
}

export const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
