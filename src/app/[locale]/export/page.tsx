import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ExportClient from "./ExportClient";

export default async function ExportPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("export");

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t("pageTitle")}</h1>
        <p className="mb-8 text-gray-600">{t("pageDescription")}</p>
        <ExportClient />
      </div>
    </div>
  );
}
