import { NextRequest, NextResponse } from "next/server";
import { resolveUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(resolveUrl("/login", request));
  response.cookies.delete({ name: "admin_token", path: "/" });
  return response;
}
