import type { EventType } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * One animated line illustration per event type. Pure SVG + CSS (see .art in globals.css), no images.
 * The markup is built from constants in this file only, never from user input.
 */
const petals = (cx: number, cy: number, n: number, r: number, rx: number, ry: number) =>
  Array.from({ length: n }, (_, i) =>
    `<ellipse cx="${cx}" cy="${cy - r}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`).join("");

const dotsRing = (cx: number, cy: number, n: number, r: number, d: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n;
    return `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${d}" class="fill"/>`;
  }).join("");

const ART: Record<EventType, () => string> = {
  mehndi: () =>
    `<g class="spin"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="78" stroke-dasharray="2 6"/>${petals(100, 100, 16, 62, 7, 16)}${petals(100, 100, 10, 38, 8, 18)}<circle cx="100" cy="100" r="16"/><circle cx="100" cy="100" r="6" class="fill"/>${dotsRing(100, 100, 32, 86, 1.6)}</g>`,
  wedding: () => {
    const bulbs = Array.from({ length: 9 }, (_, i) => {
      const x = 14 + i * 21.5, y = 34 + Math.sin((i / 8) * Math.PI) * 22;
      return `<circle cx="${x.toFixed(1)}" cy="${(y + 6).toFixed(1)}" r="3.2" class="fill bulb" style="animation-delay:${(i * 0.17).toFixed(2)}s"/>`;
    }).join("");
    return `<path d="M8 34 Q100 80 192 34"/>${bulbs}<path d="M40 200V120a60 60 0 0 1 120 0v80"/><path d="M58 200V124a42 42 0 0 1 84 0v76"/><path d="M100 64v-14M92 56h16"/><circle cx="100" cy="150" r="10"/>${petals(100, 150, 8, 12, 3, 6)}`;
  },
  walima: () => {
    const drops = Array.from({ length: 7 }, (_, i) => {
      const x = 40 + i * 20;
      return `<path class="sway" style="transform-origin:${x}px 70px;animation-delay:${i * 0.2}s" d="M${x} 70v${34 + (i % 3) * 14}"/><path class="fill" d="M${x} ${104 + (i % 3) * 14}l4 8-4 8-4-8z"/>`;
    }).join("");
    return `<path d="M100 0v30"/><path d="M40 70h120M52 52h96M64 34h72"/><path d="M40 70a60 30 0 0 0 120 0"/>${drops}${dotsRing(100, 52, 12, 30, 1.6)}`;
  },
  engagement: () =>
    `<g class="float"><circle cx="78" cy="118" r="44"/><circle cx="78" cy="118" r="36" stroke-dasharray="3 5"/><circle cx="124" cy="104" r="44"/><circle cx="124" cy="104" r="36" stroke-dasharray="3 5"/><path class="fill" d="M124 46l10 14-10 14-10-14z"/><path d="M114 60h20"/></g><path class="tw fill" d="M40 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM170 150l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>`,
  birthday: () => {
    const balloons = ([[56, 60], [100, 40], [146, 66]] as const).map(([x, y], i) =>
      `<g class="float" style="animation-delay:${i * 0.6}s"><ellipse cx="${x}" cy="${y}" rx="18" ry="22"/><path d="M${x} ${y + 22}q-6 18 4 34 q8 16-2 30"/></g>`).join("");
    return `${balloons}<rect x="58" y="150" width="84" height="44" rx="6"/><path d="M58 166c14 8 28-8 42 0s28 8 42 0"/><path d="M80 150v-14M100 150v-14M120 150v-14"/><path class="fill flame" d="M80 128c3 4 3 7 0 8-3-1-3-4 0-8zM100 128c3 4 3 7 0 8-3-1-3-4 0-8zM120 128c3 4 3 7 0 8-3-1-3-4 0-8z"/>`;
  },
  eid_gathering: () => {
    const lanterns = ([[54, 60], [100, 92], [146, 70]] as const).map(([x, y], i) =>
      `<g class="sway" style="transform-origin:${x}px 0px;animation-delay:${i * 0.5}s"><path d="M${x} 0v${y}"/><path d="M${x - 10} ${y + 6}h20l-4 26h-12z"/><path d="M${x - 6} ${y}h12l4 6h-20z" class="fill"/><circle cx="${x}" cy="${y + 19}" r="3.5" class="fill bulb"/></g>`).join("");
    return `${lanterns}<path d="M150 150a34 34 0 1 1-30-46 26 26 0 1 0 30 46z" class="fill soft"/><path class="fill tw" d="M168 112l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>`;
  },
  trip: () =>
    `<circle cx="146" cy="58" r="20" class="pulse"/>${dotsRing(146, 58, 12, 30, 1.4)}<path d="M0 160 52 92 82 124 118 70 162 128 200 96"/><path d="M0 182 40 150 80 170 130 136 200 168"/><path class="road" d="M100 200c-6-18 18-24 10-40s-26-14-18-32"/>`,
  university_event: () =>
    `<g class="float"><path d="M100 34 176 64 100 94 24 64z"/><path d="M58 78v34c0 12 84 12 84 0V78"/><path d="M176 64v38"/><circle cx="176" cy="108" r="5" class="fill"/></g><path class="beam" d="M20 200 70 120M180 200 130 120" stroke-dasharray="4 6"/><path d="M60 200h80M76 200v-26h48v26"/>`,
  other: () =>
    `<path class="tw fill" d="M60 50l4 10 10 4-10 4-4 10-4-10-10-4 10-4zM140 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM110 120l5 12 12 5-12 5-5 12-5-12-12-5 12-5z"/>${dotsRing(100, 110, 18, 76, 1.8)}`,
};

export function EventArt({ type, draw = false, className }: { type: EventType; draw?: boolean; className?: string }) {
  const svg = (ART[type] ?? ART.other)();
  return (
    <svg
      viewBox="0 0 200 200" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={cn("art", draw && "draw", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
