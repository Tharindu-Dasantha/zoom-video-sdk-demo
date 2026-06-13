import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// Allow time to stream large recording files through.
export const maxDuration = 300;

// Proxies the stored recording with a Content-Disposition: attachment header so
// the browser downloads it rather than opening it in a tab. A cross-origin
// `download` attribute on the UploadThing URL would be ignored by browsers, so
// the file has to be served same-origin to force the download.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const recording = await prisma.recording.findUnique({
    where: { id },
    include: { link: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  const upstream = await fetch(recording.uploadUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Failed to fetch recording file" },
      { status: 502 }
    );
  }

  const safeName =
    recording.link.recipientName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "") || "recording";

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "video/mp4");
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set(
    "Content-Disposition",
    `attachment; filename="testimonial-${safeName}.mp4"`
  );

  return new NextResponse(upstream.body, { headers });
}
