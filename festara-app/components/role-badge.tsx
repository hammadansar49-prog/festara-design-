import type { Role } from "@/lib/permissions";

const LABEL: Record<Role, string> = { admin: "Admin", member: "Member", guest: "Guest" };

export function RoleBadge({ role, className = "" }: { role: Role; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-xs font-semibold text-secondary-foreground ${className}`}>
      {LABEL[role]}
    </span>
  );
}
