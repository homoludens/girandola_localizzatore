import Image from "next/image";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginButton } from "@/components/LoginButton";

export default async function LoginPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/");
  }

  return <LoginContent />;
}

function LoginContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <Image
            src="/girandola.png"
            alt="Girandola"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {t("loginTitle")}
          </h1>
          <p className="text-sm text-gray-600">{t("loginDescription")}</p>
        </div>

        <LoginButton />
      </div>
    </div>
  );
}
