import { store } from "./store.ts";

/** Admin harakatini jurnalga yozadi (yangisi birinchi) */
export function logAudit(actorId: string, action: string, entityType: string, entityId: string, details?: string): void {
  store.audit.unshift({
    id: `audit-${String(store.audit.length + 1).padStart(3, "0")}-${Date.now().toString(36)}`,
    actorId,
    action,
    entityType,
    entityId,
    details,
    at: new Date().toISOString(),
  });
}
