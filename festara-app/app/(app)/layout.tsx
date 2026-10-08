import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SampleBanner } from "@/components/sample-banner";
import { getDataSource } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await (await getDataSource()).getCurrentUser();
  if (!user) redirect("/login");
  return (
    <>
      <SampleBanner />
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </>
  );
}
