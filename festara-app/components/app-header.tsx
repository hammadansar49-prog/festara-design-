import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { UserMenu } from "@/components/user-menu";
import type { Profile } from "@/lib/data/types";

export function AppHeader({ user }: { user: Profile }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/events" aria-label="Festara, your events"><Wordmark className="h-5 w-auto" /></Link>
          <nav aria-label="Main">
            <Link href="/events" className="rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium">Events</Link>
          </nav>
        </div>
        <UserMenu name={user.fullName} email={user.email} />
      </div>
    </header>
  );
}
