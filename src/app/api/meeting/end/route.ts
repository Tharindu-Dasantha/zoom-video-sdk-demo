import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called when the host leaves a meeting (explicit "Leave" or tab close via
// sendBeacon). Marks the code as ended so anyone opening the link afterwards
// gets an "ended" screen instead of starting a fresh empty room.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  await prisma.endedMeeting.upsert({
    where: { code },
    create: { code },
    update: { endedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
