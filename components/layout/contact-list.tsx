import { Globe, Mail, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Contacts } from "@/types/common";

/** Faqat http(s) havolalar ruxsat etiladi (javascript: kabi sxemalar havola bo'lmaydi) */
const safeWebsite = (url: string): string | null => (/^https?:\/\//i.test(url) ? url : null);

export function ContactList({ contacts }: { contacts: Contacts }) {
  const t = useTranslations("profile.contact");
  const website = contacts.website ? safeWebsite(contacts.website) : null;
  const rows = [
    contacts.phone && { key: "phone", Icon: Phone, label: contacts.phone, href: `tel:${contacts.phone.replace(/[^\d+]/g, "")}` },
    contacts.email && { key: "email", Icon: Mail, label: contacts.email, href: `mailto:${contacts.email}` },
    contacts.telegram && {
      key: "telegram",
      Icon: Send,
      label: contacts.telegram,
      href: `https://t.me/${contacts.telegram.replace(/^@/, "")}`,
    },
    contacts.website && { key: "website", Icon: Globe, label: contacts.website.replace(/^https?:\/\//i, ""), href: website },
  ].filter((r): r is { key: string; Icon: typeof Phone; label: string; href: string | null } => !!r);

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {rows.map(({ key, Icon, label, href }) => (
        <li key={key} className="flex min-w-0 items-center gap-2 text-sm">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t(key)}:</span>
          {href ? (
            <a href={href} className="min-w-0 truncate text-primary hover:underline" {...(key === "website" || key === "telegram" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {label}
            </a>
          ) : (
            <span className="min-w-0 truncate">{label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
