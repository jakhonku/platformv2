import type { Notification } from "../../types/system.ts";
import { DataError } from "./errors.ts";
import { simulateLatency } from "./latency.ts";
import { store } from "./store.ts";
import { clone } from "./text.ts";

export async function getNotifications(userId: string): Promise<Notification[]> {
  await simulateLatency();
  return clone(store.notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await simulateLatency();
  const n = store.notifications.find((x) => x.id === id);
  if (!n) throw new DataError("not_found", "Bildirishnoma topilmadi");
  n.read = true;
  return clone(n);
}
