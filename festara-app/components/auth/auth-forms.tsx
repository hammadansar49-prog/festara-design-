"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, resetPasswordAction, signInAction, signUpAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/state";

const initial: ActionState = {};

function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}
    >
      {state.message}
    </p>
  );
}

const describe = (state: ActionState, key: string) => (state.fieldErrors?.[key] ? `${key}-error` : undefined);

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Signing in" : "Sign in"}</Button>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline underline-offset-4">Forgot your password? Send a reset link</Link>
        <span>New to Festara? <Link href={`/register${q}`} className="font-semibold text-foreground underline underline-offset-4">Create an account</Link></span>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="fullName" label="Full name" error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={state.values?.fullName}
          aria-invalid={!!state.fieldErrors?.fullName} aria-describedby={describe(state, "fullName")} />
      </Field>
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password") ?? "password-hint"} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Creating account" : "Create account"}</Button>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href={`/login${q}`} className="font-semibold text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormMessage state={state} />
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Sending" : "Send reset link"}</Button>
      <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4">Back to sign in</Link>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormMessage state={state} />
      <Field id="password" label="New password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password") ?? "password-hint"} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving" : "Save new password"}</Button>
    </form>
  );
}
