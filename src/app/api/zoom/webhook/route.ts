import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function verifySignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
  if (!secret) return false;
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
  return `v0=${hash}` === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-zm-request-timestamp") ?? "";
  const signature = request.headers.get("x-zm-signature") ?? "";

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Zoom endpoint validation handshake (required when first saving webhook URL)
  if (payload.event === "endpoint.url_validation") {
    const { plainToken } = (payload.payload as Record<string, string>);
    const encryptedToken = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "")
      .update(plainToken)
      .digest("hex");
    return NextResponse.json({ plainToken, encryptedToken });
  }

  // Verify all other requests
  if (!verifySignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (payload.event !== "recording.completed") {
    return NextResponse.json({ received: true });
  }

  const session = payload.payload as {
    object: {
      uuid: string;
      topic: string;
      duration: number;
      download_access_token: string;
      recording_files: Array<{
        file_type: string;
        download_url: string;
        file_size: number;
        status: string;
        recording_type: string;
      }>;
    };
  };

  const { uuid, topic, duration, download_access_token, recording_files } =
    session.object;

  // topic is the Zoom session name — which equals our testimonial token
  const link = await prisma.testimonialLink.findUnique({ where: { token: topic } });
  if (!link) {
    // Not a testimonial session — ignore silently
    return NextResponse.json({ received: true });
  }

  // Prefer the combined speaker-view MP4, fall back to any MP4
  const mp4 =
    recording_files?.find(
      (f) =>
        f.file_type === "MP4" &&
        f.status === "completed" &&
        f.recording_type === "shared_screen_with_speaker_view"
    ) ??
    recording_files?.find(
      (f) => f.file_type === "MP4" && f.status === "completed"
    );

  if (!mp4) {
    console.warn(`[webhook] No completed MP4 found for session ${topic}`);
    return NextResponse.json({ received: true });
  }

  try {
    // Store a reference to Zoom's cloud recording rather than re-uploading the
    // file anywhere. `download_access_token` is Zoom's time-limited token used
    // to fetch the file; we keep the bare download URL + token separately so we
    // can build an authenticated request server-side when the admin views it.
    const recordingData = {
      uploadUrl: mp4.download_url,
      downloadToken: download_access_token,
      zoomSessionId: uuid,
      durationSec: duration ? duration * 60 : null,
      fileSizeMB: mp4.file_size ? mp4.file_size / (1024 * 1024) : null,
    };

    await prisma.$transaction([
      prisma.recording.upsert({
        where: { linkId: link.id },
        create: { linkId: link.id, ...recordingData },
        update: recordingData,
      }),
      prisma.testimonialLink.update({
        where: { id: link.id },
        data: { status: "COMPLETED" },
      }),
    ]);

    console.log(`[webhook] Recording linked for ${link.recipientName}: ${mp4.download_url}`);
  } catch (error) {
    console.error("[webhook] Failed to save recording reference:", error);
    // DB failures are often transient. Return 5xx so Zoom retries delivery.
    return NextResponse.json(
      { error: "Failed to process recording" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
