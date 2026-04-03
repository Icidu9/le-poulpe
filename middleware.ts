import { NextRequest, NextResponse } from "next/server";

const BETA_COOKIE = "poulpe_beta";
const BETA_CODE   = process.env.NEXT_PUBLIC_BETA_CODE || "POULPE2025";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Laisse passer la page beta elle-même et les assets
  if (
    pathname.startsWith("/beta") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(BETA_COOKIE);
  if (cookie?.value === BETA_CODE) {
    return NextResponse.next();
  }

  // Redirige vers la page d'accès bêta
  const url = req.nextUrl.clone();
  url.pathname = "/beta";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
