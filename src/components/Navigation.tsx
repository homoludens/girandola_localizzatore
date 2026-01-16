import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { auth, signOut } from "@/auth";

export async function Navigation() {
  const session = await auth();
  const t = await getTranslations("common");

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Girandola
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          {t("home")}
        </Link>
        {session?.user && (
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {t("dashboard")}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
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
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t("login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
