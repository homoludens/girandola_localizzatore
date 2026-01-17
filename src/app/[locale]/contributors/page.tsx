"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type Contributor = {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  count: number;
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <svg
        className="h-8 w-8 text-yellow-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg
        className="h-7 w-7 text-gray-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    );
  }
  if (rank === 3) {
    return (
      <svg
        className="h-6 w-6 text-amber-700"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center text-sm font-medium text-gray-500">
      {rank}
    </span>
  );
}

export default function ContributorsPage() {
  const t = useTranslations("contributors");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContributors() {
      try {
        const response = await fetch("/api/contributors");
        if (response.ok) {
          const data = await response.json();
          setContributors(data);
        }
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContributors();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
        {t("title")}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : contributors.length === 0 ? (
        <p className="text-center text-gray-500">{t("noContributors")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {contributors.map((contributor) => (
              <li
                key={contributor.id}
                className={`flex items-center gap-4 px-4 py-3 ${
                  contributor.rank <= 3 ? "bg-gradient-to-r from-yellow-50/50 to-transparent" : ""
                }`}
              >
                <div className="flex w-10 justify-center">
                  <RankIcon rank={contributor.rank} />
                </div>
                <div className="flex-shrink-0">
                  {contributor.image ? (
                    <Image
                      src={contributor.image}
                      alt={contributor.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {contributor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {contributor.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="font-semibold">{contributor.count}</span>
                  <span>{t("girandolas")}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
