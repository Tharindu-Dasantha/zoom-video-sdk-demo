import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called when a host starts (joins) a meeting. Clears any prior "ended" marker
// so the code is live again — the host reactivates a dead code by restarting it.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  await prisma.endedMeeting.deleteMany({ where: { code } });
  return NextResponse.json({ success: true });
}
