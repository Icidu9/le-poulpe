import { NextRequest, NextResponse } from "next/server";

const BETA_COOKIE = "poulpe_beta";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Laisse passer la page beta, la charte, l'admin et les assets
  if (
    pathname.startsWith("/beta") ||
    pathname.startsWith("/charte") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/manifest")
  ) {
    return NextResponse.next();
  }

  // Vérifie que le cookie beta existe (la validation réelle est côté serveur dans /api/validate-beta)
  const cookie = req.cookies.get(BETA_COOKIE);
  if (cookie?.value) {
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
