import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-5xl sm:text-6xl">New <span className="accent">password.</span></h1>
        <p className="text-muted-foreground">Use at least 8 characters.</p>
      </div>
      <ResetForm />
    </div>
  );
}
