"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import { PAST_DATE } from "@/lib/messages";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import { eventSchema, isPastDate } from "@/lib/validation/event";
import type { ActionState } from "./state";

export async function createEventAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(eventSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  if (isPastDate(parsed.data.eventDate) && raw.confirmPast !== "yes") {
    return { confirmPast: true, message: PAST_DATE, values: raw };
  }
  const result = await (await getDataSource()).createEvent(parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath("/events");
  redirect(`/events/${result.data.id}`);
}

export async function updateEventAction(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(eventSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  if (isPastDate(parsed.data.eventDate) && raw.confirmPast !== "yes") {
    return { confirmPast: true, message: PAST_DATE, values: raw };
  }
  const result = await (await getDataSource()).updateEvent(eventId, parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath(`/events/${eventId}`, "layout");
  return { ok: true, message: "Changes saved." };
}

export async function deleteEventAction(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const confirmName = String(fd.get("confirmName") ?? "");
  const result = await (await getDataSource()).deleteEvent(eventId, confirmName);
  if (!result.ok) return { message: result.message };
  revalidatePath("/events");
  redirect("/events");
}
