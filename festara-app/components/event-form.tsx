"use client";

import { useActionState, useState } from "react";
import { EventCard } from "@/components/event-card";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/state";
import { COVER_COLORS, COVER_LABELS, EVENT_TYPES, EVENT_TYPE_LABELS, type CoverColor, type EventType } from "@/lib/constants";

export type EventFormValues = {
  name: string; type: string; eventDate: string; location: string;
  totalBudget: string; description: string; coverColor: string;
};

export function EventForm({
  action, defaults, submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  defaults: EventFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const v = { ...defaults, ...(state.values ?? {}) } as EventFormValues;
  const e = state.fieldErrors ?? {};
  const bad = (k: string) => ({ "aria-invalid": !!e[k], "aria-describedby": e[k] ? `${k}-error` : undefined });

  // Live preview only: mirrors what is typed into the card people will see. It never feeds the action.
  const [live, setLive] = useState({ name: v.name, type: v.type, eventDate: v.eventDate, location: v.location, coverColor: v.coverColor });
  const mirror = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    setLive((l) => ({ ...l, name: String(fd.get("name") ?? ""), eventDate: String(fd.get("eventDate") ?? ""), location: String(fd.get("location") ?? ""), coverColor: String(fd.get("coverColor") ?? l.coverColor) }));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
    {/* The key remounts the form after an error so defaults (including the select) are reapplied. */}
    <form key={state.values ? JSON.stringify(state.values) : "initial"} action={formAction} onInput={(ev) => mirror(ev.currentTarget)} className="grid gap-6 rounded-[24px] border bg-card p-6 sm:p-8" noValidate>
      {state.message && !state.confirmPast && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}>
          {state.message}
        </p>
      )}

      <Field id="name" label="Event name" error={e.name}>
        <Input id="name" name="name" defaultValue={v.name} {...bad("name")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="type" label="Type" error={e.type}>
          <Select name="type" defaultValue={v.type || undefined} onValueChange={(t) => setLive((l) => ({ ...l, type: t }))}>
            <SelectTrigger id="type" className="w-full" {...bad("type")}><SelectValue placeholder="Choose a type" /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field id="eventDate" label="Date" error={e.eventDate}>
          <Input id="eventDate" name="eventDate" type="date" defaultValue={v.eventDate} {...bad("eventDate")} />
        </Field>
      </div>

      {state.confirmPast && (
        <label className="flex items-start gap-2 rounded-md bg-warn-tint p-3 text-sm text-warn">
          <input type="checkbox" name="confirmPast" value="yes" className="mt-1" />
          <span>{state.message}</span>
        </label>
      )}

      <Field id="location" label="Location" error={e.location}>
        <Input id="location" name="location" defaultValue={v.location} {...bad("location")} />
      </Field>

      <Field id="totalBudget" label="Total budget" error={e.totalBudget} hint="You can change this later. Budget warnings begin at 80%.">
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
          <Input id="totalBudget" name="totalBudget" inputMode="numeric" className="pl-9 tabular-nums" defaultValue={v.totalBudget}
            aria-invalid={!!e.totalBudget} aria-describedby={e.totalBudget ? "totalBudget-error" : "totalBudget-hint"} />
        </div>
      </Field>

      <Field id="description" label="Description" error={e.description}>
        <Textarea id="description" name="description" rows={3} defaultValue={v.description} {...bad("description")} />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Cover color</legend>
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((c) => (
            <label key={c} className="relative cursor-pointer">
              <input type="radio" name="coverColor" value={c} defaultChecked={v.coverColor === c} className="peer sr-only" />
              <span aria-hidden className="block size-11 rounded-2xl transition-transform duration-300 hover:-translate-y-0.5 peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-foreground peer-checked:ring-offset-2 peer-checked:ring-offset-card peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4"
                style={{ background: `var(--event-${c})` }} />
              <span className="sr-only">{COVER_LABELS[c]}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">This colors the event for everyone you invite.</p>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-fit">{pending ? "Saving" : submitLabel}</Button>
    </form>

    <aside aria-label="Live preview" className="grid gap-3 lg:sticky lg:top-24">
      <span className="lbl text-muted-foreground">Live preview</span>
      <EventCard event={{
        name: live.name || "Your event", type: (live.type || "other") as EventType, eventDate: live.eventDate || new Date().toLocaleDateString("en-CA"),
        location: live.location || null, coverColor: (live.coverColor || "mehndi") as CoverColor, role: "admin", memberCount: 1,
      }} />
      <p className="text-sm text-muted-foreground">This is how the event looks in everyone&rsquo;s list.</p>
    </aside>
    </div>
  );
}
