import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NO_ACCESS } from "@/lib/messages";

export default function EventNotFound() {
  return (
    <div className="grid justify-items-start gap-3 rounded-lg border p-8">
      <h1 className="font-display text-2xl">Event not found</h1>
      <p className="max-w-prose text-muted-foreground">{NO_ACCESS}</p>
      <Button asChild><Link href="/events">Back to your events</Link></Button>
    </div>
  );
}
