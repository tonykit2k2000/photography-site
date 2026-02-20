import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ photoId: string }>;
}

export async function POST(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { photoId } = await params;

  const [updated] = await db
    .update(galleryPhotos)
    .set({ uploadedAt: new Date() })
    .where(eq(galleryPhotos.id, photoId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json({ photo: updated });
}
