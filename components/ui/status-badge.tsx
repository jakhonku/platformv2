import { cn } from "@/lib/utils";

export type Tone = "green" | "yellow" | "red" | "blue" | "gray";

// Holat ranglari faqat badge va indikatorlarda (masterprompt 3.1)
const TONES: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/25",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/25",
  gray: "bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-white/10 dark:text-neutral-300 dark:ring-white/15",
};

export function StatusBadge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
