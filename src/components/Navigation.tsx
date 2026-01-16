import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { auth, signOut } from "@/auth";

export async function Navigation() {
  const session = await auth();
  const t = await getTranslations("common");

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-3 sm:gap-6">
        <Link href="/" className="text-lg font-bold text-gray-900 sm:text-xl">
          {t("appName")}
        </Link>
        <Link href="/" className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline">
          {t("home")}
        </Link>
        {session?.user && (
          <Link
            href="/dashboard"
            className="text-xs text-gray-600 hover:text-gray-900 sm:text-sm"
          >
            {t("dashboard")}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        {session?.user ? (
          <UserMenu
            user={session.user}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        ) : (
          <Link
            href="/login"
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
          >
            {t("login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
