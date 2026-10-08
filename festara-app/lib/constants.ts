export const EVENT_TYPES = [
  "wedding", "engagement", "mehndi", "walima", "birthday",
  "eid_gathering", "trip", "university_event", "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  mehndi: "Mehndi",
  walima: "Walima",
  birthday: "Birthday",
  eid_gathering: "Eid gathering",
  trip: "Trip",
  university_event: "University event",
  other: "Other",
};

export const COVER_COLORS = ["mehndi", "marigold", "sindoor", "kahwa", "sky", "night"] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

export const COVER_LABELS: Record<CoverColor, string> = {
  mehndi: "Mehndi green",
  marigold: "Marigold",
  sindoor: "Sindoor",
  kahwa: "Kahwa",
  sky: "Sky",
  night: "Night",
};

export const INVITE_DAYS = 7;
