import { isMock } from "@/lib/data";

export function SampleBanner() {
  if (!isMock()) return null;
  return (
    <div role="note" className="bg-marigold px-4 py-1.5 text-center text-[0.6875rem] leading-snug font-medium text-[#17141B] sm:py-2 sm:text-xs">
      Prototype on sample data. Sign in as rashid@example.com with the password festara123. Nothing here is saved to a database.
    </div>
  );
}
