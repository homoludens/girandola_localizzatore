import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MapComponent } from "@/components/map";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-[calc(100vh-57px)] w-full">
      <MapComponent />
    </div>
  );
}
