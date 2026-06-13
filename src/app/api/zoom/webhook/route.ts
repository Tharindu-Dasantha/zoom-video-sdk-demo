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
    const { plainToken } = payload.payload as Record<string, string>;
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

  // We don't store or serve recordings — the admin downloads them straight from
  // Zoom's recording tab. The link is already marked COMPLETED when the user
  // presses Done, so this just acts as a safety net in case that PATCH was
  // missed (topic is the Zoom session name, which equals our token).
  const session = payload.payload as { object: { topic: string } };
  const topic = session.object?.topic;
  if (topic) {
    await prisma.testimonialLink
      .updateMany({
        where: { token: topic, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED" },
      })
      .catch(() => {});
  }

  return NextResponse.json({ received: true });
}
