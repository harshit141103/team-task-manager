import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/projects", "/team", "/analytics", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hasSession = request.cookies.get("ttm_session")?.value === "1";

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/team/:path*", "/analytics/:path*", "/settings/:path*"]
};
