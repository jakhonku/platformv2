import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** iOS uslubidagi shaffof shisha (frosted glass) ikonka kafeli: oq, blur, yupqa yorug' chegara */

const SIZES = {
  sm: { box: "size-7", icon: "size-4" },
  md: { box: "size-10", icon: "size-5" },
  lg: { box: "size-14", icon: "size-7" },
} as const;

export function AppIcon({
  icon: Glyph,
  size = "md",
  className,
}: {
  icon: Icon;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      className={cn(
        "icon-glass squircle inline-flex shrink-0 items-center justify-center text-foreground/75",
        s.box,
        className,
      )}
    >
      <Glyph className={s.icon} />
    </span>
  );
}
