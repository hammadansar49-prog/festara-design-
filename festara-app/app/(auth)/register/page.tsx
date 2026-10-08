import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Create your account</h1>
        <p className="text-muted-foreground">One account for every event you plan or join.</p>
      </div>
      <RegisterForm next={next ?? ""} />
    </div>
  );
}
