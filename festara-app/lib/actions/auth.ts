"use server";

import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "@/lib/validation/auth";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import type { ActionState } from "./state";

/** Only allow same-site paths as a post-login destination. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/events";
}

export async function signInAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(loginSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: { email: raw.email ?? "" } };
  const result = await (await getDataSource()).signIn(parsed.data);
  if (!result.ok) return { message: result.message, values: { email: parsed.data.email } };
  redirect(safeNext(raw.next));
}

export async function signUpAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(registerSchema, raw);
  const values = { fullName: raw.fullName ?? "", email: raw.email ?? "" };
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values };
  const result = await (await getDataSource()).signUp(parsed.data);
  if (!result.ok) return { message: result.message, values };
  if (result.data.needsConfirmation) {
    return { ok: true, message: "Check your email. We sent a link to confirm your account." };
  }
  redirect(safeNext(raw.next));
}

export async function forgotPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(forgotSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: { email: raw.email ?? "" } };
  await (await getDataSource()).requestPasswordReset(parsed.data.email);
  return { ok: true, message: "If an account exists for that email, we sent a reset link." };
}

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseForm(resetSchema, formDataToObject(fd));
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };
  const result = await (await getDataSource()).resetPassword(parsed.data.password);
  if (!result.ok) return { message: result.message };
  redirect("/events");
}

export async function signOutAction(): Promise<void> {
  await (await getDataSource()).signOut();
  redirect("/login");
}
