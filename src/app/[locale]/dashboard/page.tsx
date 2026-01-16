import { useTranslations } from "next-intl";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-gray-600">{t("description")}</p>
    </div>
  );
}
