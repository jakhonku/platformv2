import type { Notification, NotificationChannel } from "../../types/system.ts";
import { iso } from "./now.ts";
import { USERS } from "./users.ts";

const CHANNELS: NotificationChannel[] = ["internal", "email", "sms", "telegram"];

const TEMPLATES: { title: string; body: string; link?: string }[] = [
  { title: "Arizangiz koʻrib chiqildi", body: "Tashkilot arizangizni koʻrib chiqdi. Holat yangilandi.", link: "/cabinet/applications" },
  { title: "Sizga mos yangi kasting", body: "Mutaxassisligingizga mos yangi kasting eʼlon qilindi.", link: "/castings" },
  { title: "Taklif keldi", body: "Tashkilot sizni suhbatga taklif qildi.", link: "/cabinet/offers" },
  { title: "Profil tasdiqlandi", body: "Profilingiz moderatordan oʻtdi va ommaga koʻrinadi.", link: "/cabinet/profile" },
  { title: "Media fayl moderatsiyadan oʻtdi", body: "Yuklagan materialingiz tasdiqlandi.", link: "/cabinet/portfolio" },
  { title: "Yangi koʻrishlar", body: "Portfolioingiz bu hafta 120 marta koʻrildi.", link: "/cabinet/stats" },
];

const recipients = USERS.filter((u) => u.status === "active" && !u.roles.includes("admin") && !u.roles.includes("moderator")).slice(0, 12);

export const NOTIFICATIONS: Notification[] = Array.from({ length: 18 }, (_, i) => {
  const tpl = TEMPLATES[i % TEMPLATES.length];
  return {
    id: `notification-${String(i + 1).padStart(2, "0")}`,
    userId: recipients[i % recipients.length].id,
    channel: CHANNELS[i % CHANNELS.length],
    title: tpl.title,
    body: tpl.body,
    link: tpl.link,
    read: i % 3 === 0,
    // Yangisi birinchi
    createdAt: new Date(Date.parse(iso(2026, 10, 2, 8)) - i * 9 * 3600000).toISOString(),
  };
});
