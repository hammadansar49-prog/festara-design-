import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-5xl sm:text-6xl">Forgot your <span className="accent">password?</span></h1>
        <p className="text-muted-foreground">Enter your email and we will send you a link.</p>
      </div>
      <ForgotForm />
    </div>
  );
}
