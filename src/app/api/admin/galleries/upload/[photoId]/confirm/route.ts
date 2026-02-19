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

  const photo = await db.query.galleryPhotos.findFirst({
    where: eq(galleryPhotos.id, photoId),
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Photo is already in the DB — just return it as confirmed
  // In a production system, you might verify the S3 object exists here
  return NextResponse.json({ photo });
}
