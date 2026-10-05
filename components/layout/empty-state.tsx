import { Inbox } from "@/components/icons";
import { AppIcon } from "@/components/ui/app-icon";

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 glass rounded-3xl px-4 py-12 text-center">
      <AppIcon icon={Inbox} size="lg" />
      <p className="font-medium">{title}</p>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
