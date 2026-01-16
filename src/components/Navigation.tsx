import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const t = useTranslations("common");

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Girandola
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {t("home")}
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t("login")}
        </button>
      </div>
    </nav>
  );
}
