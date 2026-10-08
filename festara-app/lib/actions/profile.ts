"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "@/lib/data";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import { profileSchema } from "@/lib/validation/profile";
import type { ActionState } from "./state";

export async function updateProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(profileSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  const result = await (await getDataSource()).updateProfile(parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved.", values: { fullName: result.data.fullName, phone: result.data.phone ?? "" } };
}
