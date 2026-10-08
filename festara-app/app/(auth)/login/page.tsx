import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to see the events you belong to.</p>
      </div>
      <LoginForm next={next ?? ""} />
    </div>
  );
}
