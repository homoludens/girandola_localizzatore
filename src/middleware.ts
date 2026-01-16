import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => {
    const patternWithLocale = new RegExp(`^/(en|it)${route}(/.*)?$`);
    const patternWithoutLocale = new RegExp(`^${route}(/.*)?$`);
    return patternWithLocale.test(pathname) || patternWithoutLocale.test(pathname);
  });
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
      // Get the locale from the URL or default to 'en'
      const localeMatch = pathname.match(/^\/(en|it)/);
      const locale = localeMatch ? localeMatch[1] : "en";
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
