import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("description")}</p>
    </div>
  );
}
