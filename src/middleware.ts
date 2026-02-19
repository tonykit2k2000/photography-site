import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ── Admin route protection ────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/signin") {
    const session = await auth();
    if (!session?.user?.adminId) {
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
    "/admin/:path*",
    "/gallery/:path*",
    // Exclude API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
