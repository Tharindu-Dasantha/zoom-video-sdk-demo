import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getData } from "@/data/getToken";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const link = await prisma.testimonialLink.findUnique({ where: { token } });

  if (!link) {
    return NextResponse.json({ error: "Link not found or expired" }, { status: 404 });
  }

  if (link.status === "COMPLETED") {
    return NextResponse.json(
      { error: "COMPLETED", recipientName: link.recipientName },
      { status: 409 }
    );
  }

  const jwt = getData(token);

  return NextResponse.json({
    recipientName: link.recipientName,
    sessionName: token,
    jwt,
  });
}

// Called by the client to advance the link's lifecycle:
//   action "start"    → PENDING → IN_PROGRESS (user joined)
//   action "complete" → PENDING/IN_PROGRESS → COMPLETED (user pressed Done)
//
// Marking COMPLETED here makes the link single-use the moment the recorder
// finishes, rather than waiting for Zoom's recording.completed webhook (which
// can lag by minutes or never fire if recording failed to start). The webhook
// later upserts the recording file onto the already-completed link.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const body = await request.json().catch(() => ({}));
  const action = body?.action === "complete" ? "complete" : "start";

  if (action === "complete") {
    await prisma.testimonialLink.updateMany({
      where: { token, status: { in: ["PENDING", "IN_PROGRESS"] } },
      data: { status: "COMPLETED" },
    });
  } else {
    await prisma.testimonialLink.updateMany({
      where: { token, status: "PENDING" },
      data: { status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json({ success: true });
}
