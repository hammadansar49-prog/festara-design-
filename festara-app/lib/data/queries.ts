import { cache } from "react";
import { getDataSource } from "@/lib/data";

/** One event lookup per request, shared by the event layout and its pages. */
export const getEventCached = cache(async (eventId: string) => (await getDataSource()).getEvent(eventId));
