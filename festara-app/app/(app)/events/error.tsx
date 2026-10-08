"use client";

import { Button } from "@/components/ui/button";

export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="grid justify-items-start gap-3 rounded-lg border p-8">
      <h1 className="font-display text-2xl">Your events didn't load</h1>
      <p className="text-muted-foreground">Check your connection and try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
