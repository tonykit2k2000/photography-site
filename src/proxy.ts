import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ────────────────────────────────────────────────
  // Quick cookie check — full JWT verification happens in (admin)/layout.tsx
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/signin")) {
    const hasSession =
      request.cookies.has("__Secure-authjs.session-token") ||
      request.cookies.has("authjs.session-token");

    if (!hasSession) {
      const signInUrl = new URL("/admin/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // ── Gallery route protection ──────────────────────────────────────────────
  // Match /gallery/[token] but NOT /gallery/[token]/unlock
  const galleryMatch = pathname.match(/^\/gallery\/([^/]+)$/);
  if (galleryMatch) {
    const token = galleryMatch[1];
    const cookieName = `gallery_session_${token}`;
    const sessionCookie = request.cookies.get(cookieName);

    if (!sessionCookie?.value) {
      return NextResponse.redirect(
        new URL(`/gallery/${token}/unlock`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/((?!signin$).*)", // all /admin/* except /admin/signin
    "/admin", // /admin root
    "/gallery/:path*",
  ],
};
