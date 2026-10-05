"use client";

import { Moon, Sun } from "@/components/icons";
import { useTranslations } from "next-intl";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "theme";

/** Kunduz/tun almashtirgich: iOS "switch" uslubida, yumshoq View Transition bilan */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("common.theme");
  const dark = useIsDark();

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    const apply = () => document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* private rejim: tanlov saqlanmaydi, lekin almashadi */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) {
      const transition = (document as Document & { startViewTransition: (cb: () => void) => Record<"ready" | "finished" | "updateCallbackDone", Promise<void>> }).startViewTransition(apply);
      // Sahifa fonda bo'lsa (hidden) o'tish bekor qilinadi: bu xato emas, mavzu baribir almashadi
      for (const p of [transition.ready, transition.finished, transition.updateCallbackDone]) p.catch(() => undefined);
    } else {
      apply();
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? t("toLight") : t("toDark")}
      title={dark ? t("toLight") : t("toDark")}
      onClick={toggle}
      className={cn(
        "glass relative h-7 w-12 shrink-0 cursor-pointer rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-8 sm:w-[3.75rem]",
        className,
      )}
    >
      <Sun aria-hidden className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-foreground/45 sm:left-2.5 sm:size-4" />
      <Moon aria-hidden className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-foreground/45 sm:right-2.5 sm:size-4" />
      <span className="absolute top-0.5 left-0.5 flex size-[calc(1.75rem-6px)] items-center justify-center rounded-full bg-white text-amber-500 shadow-md transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:size-[calc(2rem-6px)] dark:translate-x-5 dark:bg-[#2b3345] dark:text-sky-200 sm:dark:translate-x-7">
        <Sun aria-hidden className="size-3.5 transition-opacity duration-200 sm:size-4 dark:absolute dark:opacity-0" />
        <Moon aria-hidden className="absolute size-3.5 opacity-0 transition-opacity duration-200 sm:size-4 dark:opacity-100" />
      </span>
    </button>
  );
}
