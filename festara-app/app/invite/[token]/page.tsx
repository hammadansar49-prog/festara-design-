import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SampleBanner } from "@/components/sample-banner";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/lib/actions/members";
import { getDataSource } from "@/lib/data";
import { formatEventDate } from "@/lib/date";

export const metadata: Metadata = { title: "You're invited" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ds = await getDataSource();
  const [user, preview] = await Promise.all([ds.getCurrentUser(), ds.getInvitationPreview(token)]);
  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <>
      <SampleBanner />
      <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-8">
        <Link href="/" aria-label="Festara home" className="justify-self-start"><Wordmark className="h-6 w-auto" /></Link>

        {!preview.ok ? (
          <section className="grid gap-4 rounded-lg border bg-card p-6">
            <span className="lbl text-muted-foreground">Invite link</span>
            <h1 className="font-display text-[1.75rem]">This link has expired</h1>
            <p className="text-lg">{preview.message} Ask the person who invited you to send a new one.</p>
            <Button asChild variant="outline" size="lg"><Link href="/login">Go to sign in</Link></Button>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="flex min-h-48 flex-col justify-end gap-2 p-6"
              style={{ background: `var(--event-${preview.data.coverColor})`, color: `var(--event-${preview.data.coverColor}-fg)` }}>
              <span className="lbl opacity-85">You're invited</span>
              <h1 className="font-display text-[2rem]">{preview.data.eventName}</h1>
            </div>
            <div className="grid gap-5 p-6">
              <p className="text-lg">
                <strong>{preview.data.inviterName}</strong> invited you to join as a <strong>{preview.data.role === "guest" ? "Guest" : "Member"}</strong>.
              </p>
              <ul className="grid gap-3 text-base">
                <li className="flex items-start gap-3"><CalendarDays className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{formatEventDate(preview.data.eventDate)}</li>
                {preview.data.location && <li className="flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{preview.data.location}</li>}
              </ul>
              {user ? (
                <form action={acceptInvitationAction.bind(null, token)}>
                  <Button type="submit" size="lg" className="h-13 w-full">Join {preview.data.eventName}</Button>
                </form>
              ) : (
                <div className="grid gap-3">
                  <Button asChild size="lg" className="h-13 w-full"><Link href={`/register?next=${next}`}>Join {preview.data.eventName}</Link></Button>
                  <Button asChild variant="ghost" size="lg"><Link href={`/login?next=${next}`}>I already have an account</Link></Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {preview.data.role === "guest" ? "As a guest you can see the event details." : "As a member you can see everything about the event and add to it."}
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
