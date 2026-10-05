import { ArrowLeft } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export function DetailShell({ backHref, backLabel, children }: { backHref: string; backLabel: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      <Link href={backHref} className="glass inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
