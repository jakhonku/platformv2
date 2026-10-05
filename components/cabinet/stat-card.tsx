import type { Icon } from "@/components/icons";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: Icon }) {
  return (
    <Card className="gap-1 p-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="min-w-0 truncate">{label}</span>
        <Icon className="size-4 shrink-0" aria-hidden />
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
