import { redirect } from "next/navigation";
import { Landing } from "@/components/landing/landing";
import { getDataSource } from "@/lib/data";

export default async function Home() {
  const user = await (await getDataSource()).getCurrentUser();
  if (user) redirect("/events");
  return <Landing />;
}
