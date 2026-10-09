import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventArt } from "@/components/brand/event-art";
import { Star, Wordmark } from "@/components/brand/wordmark";
import { SampleBanner } from "@/components/sample-banner";
import { Tilt } from "@/components/tilt";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/lib/actions/members";
import type { CoverColor, EventType } from "@/lib/constants";
import { getDataSource } from "@/lib/data";
import { formatEventDate } from "@/lib/date";

export const metadata: Metadata = { title: "You're invited" };

/** The invite preview carries a cover colour but not a type, so the colour picks the line art. */
const ART_FOR_COVER: Record<CoverColor, EventType> = {
  mehndi: "mehndi", sindoor: "wedding", kahwa: "walima", sky: "trip", night: "university_event", marigold: "eid_gathering",
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ds = await getDataSource();
  const [user, preview] = await Promise.all([ds.getCurrentUser(), ds.getInvitationPreview(token)]);
  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <>
      <SampleBanner />
      <main className="grid min-h-dvh content-center justify-items-center gap-8 px-4 py-10">
        <Link href="/" aria-label="Festara home" className="flex items-center gap-2"><Star className="size-7" /><Wordmark className="h-6 w-auto" /></Link>

        {!preview.ok ? (
          <section
            data-cover="night"
            className="cover grid w-full max-w-lg gap-5 rounded-[28px] p-8 sm:p-10"
            style={{ background: "var(--event-night)", color: "var(--event-night-fg)" }}
          >
            <EventArt type="university_event" className="-right-6 -top-4 w-56 opacity-30" />
            <span className="lbl opacity-90">Invite link</span>
            <h1 className="font-display text-5xl">This link has <span className="accent">expired</span></h1>
            <p className="text-lg opacity-90">{preview.message} Ask the person who invited you to send a new one.</p>
            <Button asChild variant="outline" size="lg" className="w-fit border-current bg-transparent text-current"><Link href="/login">Go to sign in</Link></Button>
          </section>
        ) : (
          <Tilt className="w-full max-w-lg" max={5}>
            <section className="overflow-hidden rounded-[28px] border bg-card shadow-[0_60px_100px_-50px_rgb(0_0_0/.8)]">
              <div
                data-cover={preview.data.coverColor}
                className="cover flex min-h-72 flex-col justify-end gap-3 p-8 sm:p-10"
                style={{ background: `var(--event-${preview.data.coverColor})`, color: `var(--event-${preview.data.coverColor}-fg)` }}
              >
                <EventArt type={ART_FOR_COVER[preview.data.coverColor]} draw className="-right-4 top-4 w-60 opacity-40" />
                <span className="lbl opacity-90">You&apos;re invited</span>
                <h1 className="font-display text-5xl sm:text-6xl">{preview.data.eventName}</h1>
              </div>
              {/* perforation */}
              <div aria-hidden className="relative h-0 border-t-2 border-dashed border-border">
                <span className="absolute -top-4 -left-4 size-8 rounded-full bg-background" />
                <span className="absolute -top-4 -right-4 size-8 rounded-full bg-background" />
              </div>
              <div className="grid gap-5 p-8 sm:p-10">
                <p className="text-lg">
                  <strong>{preview.data.inviterName}</strong> invited you to join as a <strong>{preview.data.role === "guest" ? "Guest" : "Member"}</strong>.
                </p>
                <ul className="grid gap-3 text-base">
                  <li className="flex items-start gap-3"><CalendarDays className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{formatEventDate(preview.data.eventDate)}</li>
                  {preview.data.location && <li className="flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{preview.data.location}</li>}
                </ul>
                {user ? (
                  <form action={acceptInvitationAction.bind(null, token)}>
                    <Button type="submit" size="lg" className="w-full">Join {preview.data.eventName}</Button>
                  </form>
                ) : (
                  <div className="grid gap-3">
                    <Button asChild size="lg" className="w-full"><Link href={`/register?next=${next}`}>Join {preview.data.eventName}</Link></Button>
                    <Button asChild variant="ghost" size="lg"><Link href={`/login?next=${next}`}>I already have an account</Link></Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {preview.data.role === "guest" ? "As a guest you can see the event details." : "As a member you can see everything about the event and add to it."}
                </p>
              </div>
            </section>
          </Tilt>
        )}
      </main>
    </>
  );
}
