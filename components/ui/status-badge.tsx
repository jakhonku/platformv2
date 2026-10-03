import { cn } from "@/lib/utils";

export type Tone = "green" | "yellow" | "red" | "blue" | "gray";

// Holat ranglari faqat badge va indikatorlarda (masterprompt 3.1)
const TONES: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  gray: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
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
