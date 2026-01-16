"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  signOutAction: () => Promise<void>;
};

export function UserMenu({ user, signOutAction }: UserMenuProps) {
  const t = useTranslations("auth");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
        aria-label={t("userMenu")}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User avatar"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          <div className="border-b border-gray-100 px-4 pb-3 pt-1">
            {user.name && (
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
            )}
            {user.email && (
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            )}
          </div>
          <form action={signOutAction} className="px-2 pt-2">
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
