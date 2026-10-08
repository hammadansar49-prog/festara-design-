import { notFound } from "next/navigation";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { EventForm } from "@/components/event-form";
import { updateEventAction } from "@/lib/actions/events";
import { getEventCached } from "@/lib/data/queries";
import { can } from "@/lib/permissions";

export default async function EventSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role } = result.data;
  if (!can(role, "event.edit")) {
    return <p className="text-muted-foreground">Only the Admin can change this event's settings.</p>;
  }
  return (
    <div className="grid max-w-xl gap-10">
      <EventForm
        action={updateEventAction.bind(null, id)}
        submitLabel="Save changes"
        defaults={{
          name: event.name, type: event.type, eventDate: event.eventDate, location: event.location ?? "",
          totalBudget: String(event.totalBudget), description: event.description ?? "", coverColor: event.coverColor,
        }}
      />
      <section aria-labelledby="danger" className="grid gap-3 border-t pt-6">
        <h2 id="danger" className="text-lg font-semibold">Delete event</h2>
        <p className="text-sm text-muted-foreground">Members, guests and expenses go with it. This can't be undone.</p>
        <DeleteEventDialog eventId={id} eventName={event.name} />
      </section>
    </div>
  );
}
