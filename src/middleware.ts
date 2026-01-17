import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/auth/edge";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/"];

function isProtectedRoute(pathname: string): boolean {
  // Check for root path (with or without locale)
  if (pathname === "/" || pathname === "/en" || pathname === "/it") {
    return true;
  }
  // Skip login page
  if (pathname.includes("/login")) {
    return false;
  }
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip auth routes
  if (pathname.includes("/api/auth")) {
    return NextResponse.next();
  }

  // Check if accessing a protected route
  if (isProtectedRoute(pathname)) {
    if (!req.auth?.user) {
      // Get the locale from the URL or default to 'it'
      const localeMatch = pathname.match(/^\/(en|it)/);
      const locale = localeMatch ? localeMatch[1] : "it";
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Run the internationalization middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/", "/(en|it)/:path*", "/dashboard/:path*"],
};
