import { isMock } from "@/lib/data";

export function SampleBanner() {
  if (!isMock()) return null;
  return (
    <div role="note" className="bg-warn-tint px-4 py-2 text-center text-xs text-warn">
      Prototype on sample data. Sign in as rashid@example.com with the password festara123. Nothing here is saved to a database.
    </div>
  );
}
