import { notFound } from "next/navigation";
import { MembersPanel } from "@/components/members-panel";
import { getDataSource } from "@/lib/data";
import { getEventCached } from "@/lib/data/queries";
import { daysLeft } from "@/lib/date";
import { can } from "@/lib/permissions";

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getEventCached(id);
  if (!detail.ok) notFound();
  const ds = await getDataSource();
  const me = (await ds.getCurrentUser())!;
  const members = await ds.listMembers(id);
  if (!members.ok) return <p className="text-muted-foreground">{members.message}</p>;

  const canManage = can(detail.data.role, "member.manage");
  const invites = canManage ? await ds.listInvitations(id) : null;

  return (
    <MembersPanel
      eventId={id}
      eventName={detail.data.event.name}
      currentUserId={me.id}
      members={members.data}
      canManage={canManage}
      invites={(invites && invites.ok ? invites.data : []).map((i) => ({ id: i.id, token: i.token, role: i.role, daysLeft: daysLeft(i.expiresAt) }))}
    />
  );
}
