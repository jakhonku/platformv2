import { getTranslations } from "next-intl/server";
import { EventCard } from "@/components/content/event-card";
import { CardSkeletons } from "@/components/layout/card-skeletons";
import { EmptyState } from "@/components/layout/empty-state";
import { getCompetitions, getFestivals } from "@/lib/data";
import { GRID, HomeSection } from "./home-section";

async function EventsList() {
  const [t, competitions, festivals] = await Promise.all([
    getTranslations("home"),
    getCompetitions({}, 1, 100),
    getFestivals({}, 1, 100),
  ]);

  const events = [
    ...competitions.items.map((event) => ({ kind: "competition" as const, event })),
    ...festivals.items.map((event) => ({ kind: "festival" as const, event })),
  ]
    .filter((x) => x.event.status !== "finished")
    .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate))
    .slice(0, 4);

  if (events.length === 0) return <EmptyState title={t("emptyTitle")} text={t("emptyText")} />;
  return (
    <div className={GRID}>
      {events.map((x) =>
        x.kind === "competition" ? (
          <EventCard key={x.event.id} kind="competition" event={x.event} />
        ) : (
          <EventCard key={x.event.id} kind="festival" event={x.event} />
        ),
      )}
    </div>
  );
}

export async function EventsSection() {
  const t = await getTranslations("home");
  return (
    <HomeSection
      id="events"
      title={t("eventsTitle")}
      href="/competitions"
      hrefLabel={t("viewAll")}
      fallback={
        <div className={GRID}>
          <CardSkeletons count={4} media />
        </div>
      }
    >
      <EventsList />
    </HomeSection>
  );
}
