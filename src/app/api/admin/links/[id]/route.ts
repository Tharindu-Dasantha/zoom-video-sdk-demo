import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { utapi } from "@/lib/uploadthing";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const link = await prisma.testimonialLink.findUnique({
    where: { id },
    include: { recording: true },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Remove the stored video from UploadThing first so deleting a link doesn't
  // leave an orphaned file behind. The DB row cascades via the schema relation.
  if (link.recording?.fileKey) {
    try {
      await utapi.deleteFiles(link.recording.fileKey);
    } catch (err) {
      console.warn("[links] Failed to delete recording file:", err);
    }
  }

  await prisma.testimonialLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
