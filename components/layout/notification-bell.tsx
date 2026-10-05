import { Bell } from "@/components/icons";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

// Statik belgi: haqiqiy bildirishnomalar 8-bosqichda lib/data orqali ulanadi
export function NotificationBell({ href, unread = 0 }: { href: string; unread?: number }) {
  const t = useTranslations("common");
  return (
    <Button
      nativeButton={false}
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`${t("notifications")}${unread ? ` (${unread})` : ""}`}
      render={<Link href={href} />}
    >
      <Bell />
      {unread > 0 && (
        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Button>
  );
}
