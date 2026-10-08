export interface SamplePoint { date: string; rsvps: number; spend: number }
export interface SampleDashboard { points: SamplePoint[]; confirmed: number; invited: number; spent: number }

/** Small seeded PRNG so the same event always shows the same sample figures (server and client agree). */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/**
 * Sample figures for the modules that are still Planned (Guests/RSVP and Budget).
 * Cumulative curves over the last 90 days. Never read from or written to the data source.
 */
export function sampleDashboard(eventId: string, totalBudget: number, memberCount: number, today = new Date()): SampleDashboard {
  const rnd = mulberry32(hash(eventId));
  const days = 90;
  const invited = Math.max(20, memberCount * 5 + Math.floor(rnd() * 30));
  const confirmedEnd = Math.round(invited * (0.55 + rnd() * 0.2));
  const spentEnd = Math.round(totalBudget * (0.4 + rnd() * 0.3));
  const points: SamplePoint[] = [];
  let r = 0;
  let s = 0;
  for (let i = 0; i < days; i++) {
    const p = (i + 1) / days;
    const curve = p * p * (3 - 2 * p); // smoothstep: slow start, busy middle, settles
    r = Math.max(r, Math.round(confirmedEnd * curve * (0.94 + rnd() * 0.12)));
    s = Math.max(s, Math.round((spentEnd * Math.pow(p, 1.4) * (0.94 + rnd() * 0.12)) / 500) * 500);
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i));
    points.push({ date: d.toLocaleDateString("en-CA"), rsvps: Math.min(r, confirmedEnd), spend: Math.min(s, spentEnd) });
  }
  const last = points[points.length - 1];
  return { points, confirmed: last.rsvps, invited, spent: last.spend };
}
