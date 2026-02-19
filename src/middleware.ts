import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ── Admin route protection ────────────────────────────────────────────────
  // /admin/signin is excluded by the matcher below so it always passes through
  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user?.adminId) {
      const signInUrl = new URL("/admin/signin", req.url);
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
    const sessionCookie = req.cookies.get(cookieName);

    if (!sessionCookie?.value) {
      return NextResponse.redirect(
        new URL(`/gallery/${token}/unlock`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/((?!signin$).*)", // all /admin/* EXCEPT /admin/signin
    "/admin", // /admin root itself
    "/gallery/:path*",
  ],
};
