import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { getDataSource } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = (await (await getDataSource()).getCurrentUser())!;
  return (
    <div className="grid max-w-xl gap-8">
      <div className="grid gap-2">
        <span className="lbl text-muted-foreground">Profile</span>
        <h1 className="font-display text-5xl sm:text-6xl">Your <span className="accent">profile</span></h1>
      </div>
      <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
    </div>
  );
}
