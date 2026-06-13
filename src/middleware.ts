import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { resolveUrl } from "@/lib/site-url";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(resolveUrl("/login", request));
    }

    try {
      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
      await jwtVerify(token, secret);
    } catch {
      const res = NextResponse.redirect(resolveUrl("/login", request));
      res.cookies.delete({ name: "admin_token", path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
