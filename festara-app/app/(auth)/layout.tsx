import Link from "next/link";
import { Star, Wordmark } from "@/components/brand/wordmark";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { SampleBanner } from "@/components/sample-banner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SampleBanner />
      <div className="grid min-h-dvh lg:grid-cols-2">
        <main className="flex flex-col justify-center gap-10 px-5 py-12 sm:px-12 lg:px-16 xl:px-24">
          <div className="flex w-full max-w-sm items-center justify-between">
            <Link href="/" aria-label="Festara home" className="flex items-center gap-2"><Star className="size-7" /><Wordmark className="h-6 w-auto" /></Link>
            <ThemeToggle />
          </div>
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <AuthShowcase />
      </div>
    </>
  );
}
