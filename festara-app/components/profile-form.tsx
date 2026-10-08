"use client";

import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/state";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, {} as ActionState);
  const v = { fullName, phone, ...(state.values ?? {}) };
  const e = state.fieldErrors ?? {};
  return (
    <form key={state.values ? JSON.stringify(state.values) : "initial"} action={action} className="grid gap-5" noValidate>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}>{state.message}</p>
      )}
      <Field id="fullName" label="Full name" error={e.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} aria-invalid={!!e.fullName} aria-describedby={e.fullName ? "fullName-error" : undefined} />
      </Field>
      <Field id="phone" label="Phone number" error={e.phone} hint="Optional. Members of your events can see it.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} aria-invalid={!!e.phone} aria-describedby={e.phone ? "phone-error" : "phone-hint"} />
      </Field>
      <Field id="email" label="Email" hint="Your email can't be changed here.">
        <Input id="email" value={email} disabled readOnly aria-describedby="email-hint" />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="w-fit">{pending ? "Saving" : "Save profile"}</Button>
    </form>
  );
}
