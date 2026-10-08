"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RoleBadge } from "@/components/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Member } from "@/lib/data/types";
import type { Role } from "@/lib/permissions";
import { initials } from "@/lib/text";

type Key = "fullName" | "role" | "joinedAt";
const ORDER: Record<Role, number> = { admin: 0, member: 1, guest: 2 };
const joined = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function MembersTable({ members, manageHref }: { members: Member[]; manageHref?: string }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "role", dir: 1 });
  const rows = useMemo(() => {
    const cmp = (a: Member, b: Member) =>
      sort.key === "role" ? ORDER[a.role] - ORDER[b.role] : String(a[sort.key]).localeCompare(String(b[sort.key]));
    return [...members].sort((a, b) => cmp(a, b) * sort.dir || a.fullName.localeCompare(b.fullName));
  }, [members, sort]);

  const head = (key: Key, label: string) => {
    const active = sort.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
    return (
      <TableHead aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
        <button
          type="button" onClick={() => setSort({ key, dir: active && sort.dir === 1 ? -1 : 1 })}
          className="-ml-2 inline-flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-secondary"
        >
          {label}<Icon className="size-3.5 text-muted-foreground" aria-hidden />
        </button>
      </TableHead>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>People</CardTitle>
        <CardDescription>{members.length} {members.length === 1 ? "member" : "members"} in this event</CardDescription>
        {manageHref && <CardAction><Button asChild variant="outline" size="sm"><Link href={manageHref}>Manage</Link></Button></CardAction>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>{head("fullName", "Name")}{head("role", "Role")}{head("joinedAt", "Joined")}</TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8"><AvatarFallback className="bg-secondary text-xs font-semibold">{initials(m.fullName)}</AvatarFallback></Avatar>
                      <div className="grid leading-tight">
                        <span className="font-medium">{m.fullName}</span>
                        <span className="text-xs text-muted-foreground">{m.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RoleBadge role={m.role} /></TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{joined.format(new Date(m.joinedAt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
