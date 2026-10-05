import { CollectiveEventsAdmin } from "@/components/admin/collective-events-admin";
import { ModerationPage } from "@/components/admin/moderation-page";
import { getCollectives } from "@/lib/data";
import { getDemoRole } from "@/lib/demo/server";

export default async function Page() {
  const role = await getDemoRole();
  const collectives = role === "admin" ? (await getCollectives({}, 1, 200)).items : [];
  return (
    <div className="flex flex-col gap-6">
      <ModerationPage kind="collective" section="collectives" />
      {role === "admin" && <CollectiveEventsAdmin collectives={collectives.map((c) => ({ id: c.id, name: c.name, events: c.events }))} />}
    </div>
  );
}
