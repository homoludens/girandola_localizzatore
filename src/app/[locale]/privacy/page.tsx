"use client";

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-gray-600">{t("lastUpdated")}</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section1Title")}</h2>
          <p className="text-gray-700">{t("section1Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section2Title")}</h2>
          <p className="text-gray-700">{t("section2Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section3Title")}</h2>
          <p className="text-gray-700">{t("section3Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section4Title")}</h2>
          <p className="text-gray-700">{t("section4Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section5Title")}</h2>
          <p className="text-gray-700">{t("section5Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section6Title")}</h2>
          <p className="text-gray-700">{t("section6Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section7Title")}</h2>
          <p className="text-gray-700">{t("section7Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section8Title")}</h2>
          <p className="text-gray-700">{t("section8Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section9Title")}</h2>
          <p className="text-gray-700">{t("section9Content")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("section10Title")}</h2>
          <p className="text-gray-700">{t("section10Content")}</p>
        </section>
      </div>
    </div>
  );
}
