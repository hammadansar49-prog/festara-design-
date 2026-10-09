import type { Role } from "@/lib/permissions";

const LABEL: Record<Role, string> = { admin: "Admin", member: "Member", guest: "Guest" };
const TONE: Record<Role, string> = {
  admin: "bg-primary text-primary-foreground",
  member: "bg-marigold/25 text-foreground ring-1 ring-marigold/40",
  guest: "bg-secondary text-muted-foreground ring-1 ring-border",
};

export function RoleBadge({ role, className = "" }: { role: Role; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-semibold ${TONE[role]} ${className}`}>
      {LABEL[role]}
    </span>
  );
}
