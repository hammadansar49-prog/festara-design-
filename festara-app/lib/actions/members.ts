"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import type { Result } from "@/lib/data/result";
import type { InviteRole } from "@/lib/data/types";
import type { Role } from "@/lib/permissions";

const membersPath = (eventId: string) => `/events/${eventId}/members`;

export async function createInvitationAction(eventId: string, role: InviteRole): Promise<Result<{ token: string }>> {
  const result = await (await getDataSource()).createInvitation(eventId, role);
  if (!result.ok) return result;
  revalidatePath(membersPath(eventId));
  return { ok: true, data: { token: result.data.token } };
}

export async function changeRoleAction(eventId: string, userId: string, role: Role): Promise<Result<null>> {
  const result = await (await getDataSource()).changeRole(eventId, userId, role);
  if (result.ok) revalidatePath(membersPath(eventId));
  return result;
}

export async function removeMemberAction(eventId: string, userId: string): Promise<Result<null>> {
  const result = await (await getDataSource()).removeMember(eventId, userId);
  if (result.ok) revalidatePath(membersPath(eventId));
  return result;
}

/** Used by the invite page. Success goes to the event; any failure goes back to the invite page to explain. */
export async function acceptInvitationAction(token: string): Promise<void> {
  const result = await (await getDataSource()).acceptInvitation(token);
  if (result.ok) {
    revalidatePath("/events");
    redirect(`/events/${result.data.eventId}`);
  }
  redirect(result.code === "auth" ? `/login?next=${encodeURIComponent(`/invite/${token}`)}` : `/invite/${token}`);
}
