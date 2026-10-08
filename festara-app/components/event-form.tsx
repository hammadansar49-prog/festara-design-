"use client";

import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/state";
import { COVER_COLORS, COVER_LABELS, EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/constants";

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

  return (
    // The key remounts the form after an error so defaults (including the select) are reapplied.
    <form key={state.values ? JSON.stringify(state.values) : "initial"} action={formAction} className="grid gap-5" noValidate>
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
          <Select name="type" defaultValue={v.type || undefined}>
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
              <span aria-hidden className="block size-8 rounded-full border-2 border-card ring-1 ring-input peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                style={{ background: `var(--event-${c})` }} />
              <span className="sr-only">{COVER_LABELS[c]}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">This colors the event for everyone you invite.</p>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-fit">{pending ? "Saving" : submitLabel}</Button>
    </form>
  );
}
