import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { EventCard } from "@/components/event-card";
import { SampleBanner } from "@/components/sample-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SampleBanner />
      <div className="grid min-h-dvh lg:grid-cols-2">
        <main className="flex flex-col justify-center gap-8 px-4 py-12 sm:px-12 lg:px-16">
          <Link href="/" aria-label="Festara home" className="self-start"><Wordmark className="h-7 w-auto" /></Link>
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <aside className="hidden items-center justify-center border-l bg-secondary p-12 lg:flex" aria-hidden>
          <div className="grid w-full max-w-sm gap-4">
            <span className="lbl text-muted-foreground">Your events live here</span>
            <EventCard event={{ name: "Spring Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "Main Hall, Multan", coverColor: "night", role: "admin", memberCount: 14 }} />
          </div>
        </aside>
      </div>
    </>
  );
}
