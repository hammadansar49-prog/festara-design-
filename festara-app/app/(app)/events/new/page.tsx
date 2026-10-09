import type { Metadata } from "next";
import { EventForm } from "@/components/event-form";
import { createEventAction } from "@/lib/actions/events";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div className="grid max-w-5xl gap-8">
      <div className="grid gap-2">
        <span className="lbl text-muted-foreground">New event</span>
        <h1 className="font-display text-5xl sm:text-6xl">What are you <span className="accent">planning?</span></h1>
      </div>
      <EventForm
        action={createEventAction}
        submitLabel="Create event"
        defaults={{ name: "", type: "", eventDate: "", location: "", totalBudget: "", description: "", coverColor: "mehndi" }}
      />
    </div>
  );
}
