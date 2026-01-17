import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient />;
}
