"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Girandola } from "@/types/girandola";

export default function ExportClient() {
  const t = useTranslations("export");
  const [girandolas, setGirandolas] = useState<Girandola[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchGirandolas();
  }, []);

  const fetchGirandolas = async () => {
    try {
      const response = await fetch("/api/girandolas/export");
      if (response.ok) {
        const data = await response.json();
        setGirandolas(data);
      }
    } catch (err) {
      console.error("Failed to fetch girandolas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      if (girandolas.length === 0) {
        alert(t("noData"));
        return;
      }

      // Convert to CSV
      const headers = ["Latitude", "Longitude", "User Email", "Date"];
      const csvRows = [
        headers.join(","),
        ...girandolas.map((g: any) => {
          const date = new Date(g.createdAt).toISOString();
          return [g.lat, g.lng, g.userEmail, date].join(",");
        }),
      ];
      const csvString = csvRows.join("\n");

      // Trigger download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "girandolas_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {girandolas.length} {t("girandolasCount")}
          </p>
          <p className="text-sm text-gray-500">{t("readyToExport")}</p>
        </div>
      </div>

      <button
        onClick={handleExportCsv}
        disabled={isExporting || girandolas.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t("exporting")}
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            {t("button")}
          </>
        )}
      </button>

      {girandolas.length === 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">{t("noData")}</p>
      )}
    </div>
  );
}
