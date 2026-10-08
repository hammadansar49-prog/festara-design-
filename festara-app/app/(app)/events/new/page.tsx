import type { Metadata } from "next";
import { EventForm } from "@/components/event-form";
import { createEventAction } from "@/lib/actions/events";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <span className="lbl text-muted-foreground">New event</span>
        <h1 className="font-display text-[2rem]">What are you planning?</h1>
      </div>
      <EventForm
        action={createEventAction}
        submitLabel="Create event"
        defaults={{ name: "", type: "", eventDate: "", location: "", totalBudget: "", description: "", coverColor: "mehndi" }}
      />
    </div>
  );
}
