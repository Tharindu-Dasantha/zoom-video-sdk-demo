import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { utapi } from "@/lib/uploadthing";

// Allow up to 5 minutes for downloading + uploading large recording files
export const maxDuration = 300;

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
    const downloadUrl = `${mp4.download_url}?access_token=${download_access_token}`;
    const safeName = link.recipientName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    const filename = `testimonial-${safeName}-${Date.now()}.mp4`;

    const [uploadResult] = await utapi.uploadFilesFromUrl([
      { url: downloadUrl, name: filename },
    ]);

    if (!uploadResult || uploadResult.error) {
      throw new Error(uploadResult?.error?.message ?? "Upload failed");
    }

    await prisma.$transaction([
      prisma.recording.upsert({
        where: { linkId: link.id },
        create: {
          linkId: link.id,
          uploadUrl: uploadResult.data.url,
          fileKey: uploadResult.data.key,
          zoomSessionId: uuid,
          durationSec: duration ? duration * 60 : null,
          fileSizeMB: mp4.file_size ? mp4.file_size / (1024 * 1024) : null,
        },
        update: {
          uploadUrl: uploadResult.data.url,
          fileKey: uploadResult.data.key,
          zoomSessionId: uuid,
          durationSec: duration ? duration * 60 : null,
          fileSizeMB: mp4.file_size ? mp4.file_size / (1024 * 1024) : null,
        },
      }),
      prisma.testimonialLink.update({
        where: { id: link.id },
        data: { status: "COMPLETED" },
      }),
    ]);

    console.log(`[webhook] Recording saved for ${link.recipientName}: ${uploadResult.data.url}`);
  } catch (error) {
    console.error("[webhook] Failed to process recording:", error);
    // Download/upload/DB failures are often transient. Return 5xx so Zoom
    // retries delivery rather than dropping the recording on the floor.
    return NextResponse.json(
      { error: "Failed to process recording" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
