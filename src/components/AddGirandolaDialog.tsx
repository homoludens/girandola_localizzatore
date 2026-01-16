"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface AddGirandolaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUseGps: () => void;
  onPickOnMap: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function AddGirandolaDialog({
  isOpen,
  onClose,
  onUseGps,
  onPickOnMap,
  isLoading = false,
  error = null,
}: AddGirandolaDialogProps) {
  const t = useTranslations("addGirandola");
  const tCommon = useTranslations("common");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t("title")}
        </h2>
        <p className="mb-6 text-sm text-gray-600">{t("description")}</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Use GPS Button */}
          <button
            onClick={onUseGps}
            disabled={isLoading}
            className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
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
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {isLoading ? t("gettingLocation") : t("useGps")}
              </div>
              <div className="text-sm text-gray-500">{t("useGpsDescription")}</div>
            </div>
            {isLoading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            )}
          </button>

          {/* Pick on Map Button */}
          <button
            onClick={onPickOnMap}
            disabled={isLoading}
            className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{t("pickOnMap")}</div>
              <div className="text-sm text-gray-500">
                {t("pickOnMapDescription")}
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </div>
  );
}
