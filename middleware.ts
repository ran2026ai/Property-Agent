import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt")
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already has a locale prefix
  const pathnameIsHasLocale = ["en", "hi"].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let locale = "en"; // default locale

  if (pathnameIsHasLocale) {
    // Extract the locale from the pathname (e.g., /en/about -> en)
    locale = pathname.split("/")[1];
    // Rewrite the request to remove the locale prefix
    request.nextUrl.pathname = pathname.substring(
      `/${locale}`.length
    );
  } else {
    // No locale in the path, check the cookie for the locale
    const localeFromCookie = request.cookies.get("next-locale")?.value;
    locale = localeFromCookie ?? "en"; // default to en
  }

  // Create the response
  const response = NextResponse.next();

  // Set the next-locale cookie (for client-side navigation and future requests)
  if (!request.cookies.get("next-locale")) {
    response.cookies.set("next-locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Set the Next-Locale header (for server-side detection by next-intl)
  response.headers.set("Next-Locale", locale);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};