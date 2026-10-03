import { SectionBoundary } from "@/components/home/section-boundary";
import { SectionHeader } from "@/components/layout/section-header";

/** Profil bo'limi: sarlavha darhol, kontent Suspense + xato chegarasi ichida (xato faqat shu bo'limni almashtiradi) */
export function ProfileSection({
  id,
  title,
  fallback,
  children,
}: {
  id: string;
  title: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-4">
      <SectionHeader id={id} title={title} />
      <SectionBoundary fallback={fallback}>{children}</SectionBoundary>
    </section>
  );
}

/** Statik (ma'lumot talab qilmaydigan) blok: sarlavha va karkas */
export function InfoBlock({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-3">
      <h2 id={id} className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}
