import { NextResponse } from "next/server";

// POST-only so a cross-site GET (e.g. an <img>/link) can't force a logout.
// The client clears the session by calling this then redirecting to /login.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete({ name: "admin_token", path: "/" });
  return response;
}
