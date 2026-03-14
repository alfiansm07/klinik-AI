import { NextResponse, type NextRequest } from "next/server";

import { getRouteAccess } from "@/lib/route-access";

function hasSessionCookie(request: NextRequest) {
  return request.cookies.has("better-auth.session_token")
    || request.cookies.has("__Secure-better-auth.session_token")
    || request.cookies.has("better-auth-session_token")
    || request.cookies.has("__Secure-better-auth-session_token");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const route = getRouteAccess(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!route.protected && !route.authOnly) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const isAuthenticated = hasSessionCookie(request);

  if (route.protected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (route.authOnly && isAuthenticated) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
