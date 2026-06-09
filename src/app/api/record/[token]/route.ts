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

// Called by the client when the user joins to mark link IN_PROGRESS
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await prisma.testimonialLink.updateMany({
    where: { token, status: "PENDING" },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json({ success: true });
}
