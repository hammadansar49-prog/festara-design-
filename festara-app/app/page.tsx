import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4">
      <Wordmark className="h-10 w-auto self-start" />
      <h1 className="font-display text-4xl">A calm place for people planning something together.</h1>
      <Button className="w-fit">Create event</Button>
    </main>
  );
}
