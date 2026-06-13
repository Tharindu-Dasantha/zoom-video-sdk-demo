import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

// Allow time to stream large recording files through.
export const maxDuration = 300;

// Proxies the Zoom cloud recording to the admin. The file lives in Zoom and is
// fetched with Zoom's time-limited access token, which is kept server-side and
// never exposed to the browser. `?inline=1` plays it in the tab; otherwise it
// downloads with a Content-Disposition: attachment header.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inline = request.nextUrl.searchParams.get("inline") === "1";

  const recording = await prisma.recording.findUnique({
    where: { id },
    include: { link: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  const target = recording.downloadToken
    ? `${recording.uploadUrl}?access_token=${recording.downloadToken}`
    : recording.uploadUrl;

  const upstream = await fetch(target);
  if (!upstream.ok || !upstream.body) {
    // Zoom download tokens are time-limited, so an expired token shows up here.
    return NextResponse.json(
      {
        error:
          "Could not fetch the recording from Zoom. The access link may have expired.",
      },
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
    `${inline ? "inline" : "attachment"}; filename="testimonial-${safeName}.mp4"`
  );

  return new NextResponse(upstream.body, { headers });
}
