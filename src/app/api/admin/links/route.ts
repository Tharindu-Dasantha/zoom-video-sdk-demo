import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.testimonialLink.findMany({
    include: { recording: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientName, recipientEmail } = await request.json();

  if (!recipientName?.trim()) {
    return NextResponse.json(
      { error: "Recipient name is required" },
      { status: 400 }
    );
  }

  const link = await prisma.testimonialLink.create({
    data: {
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail?.trim() || null,
    },
    include: { recording: true },
  });

  return NextResponse.json(link, { status: 201 });
}
