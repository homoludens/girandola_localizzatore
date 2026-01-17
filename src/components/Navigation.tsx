import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { auth, signOut } from "@/auth";

export async function Navigation() {
  const session = await auth();
  const t = await getTranslations("common");
  const tContributors = await getTranslations("contributors");
  const tExport = await getTranslations("export");

  return (
    <nav className="relative z-[1000] flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-3 sm:gap-6">
        <MobileMenu isAuthenticated={!!session?.user} />
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
          <Image
            src="/girandola.png"
            alt="Girandola"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="hidden sm:inline">{t("appName")}</span>
        </Link>
        {/* Desktop navigation links */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/contributors"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {tContributors("linkText")}
          </Link>
          {session?.user && (
            <Link
              href="/export"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {tExport("pageTitle")}
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
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
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
          >
            {t("login")}
          </Link>
        )}
      </div>
    </nav>
  );
}
