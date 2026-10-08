import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { BottomTabs } from "@/components/shell/bottom-tabs";
import { SiteHeader } from "@/components/shell/site-header";
import { SampleBanner } from "@/components/sample-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getDataSource } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ds = await getDataSource();
  const user = await ds.getCurrentUser();
  if (!user) redirect("/login");
  const events = (await ds.listMyEvents()).map((e) => ({ id: e.id, name: e.name, coverColor: e.coverColor, role: e.role }));
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <TooltipProvider delayDuration={300}>
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={{ name: user.fullName, email: user.email }} events={events} />
      <SidebarInset className="min-w-0">
        <SampleBanner />
        <SiteHeader events={events} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28 sm:px-8 sm:py-10 md:pb-10">{children}</main>
        <BottomTabs events={events} />
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
