import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";

export default async function Home() {
  const user = await (await getDataSource()).getCurrentUser();
  redirect(user ? "/events" : "/login");
}
