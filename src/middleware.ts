import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Build a same-origin redirect from the *incoming* request rather than an
// env-configured base URL. Behind Railway's proxy, NEXT_PUBLIC_APP_URL is
// inlined at build time and, if unset/stale/wrong, sends the redirect to a dead
// host — surfacing as Railway's "Application failed to respond". Cloning
// request.nextUrl keeps us on whatever domain the user actually hit.
function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  // Railway terminates TLS at the proxy, so the internal request may look like
  // http; honour the forwarded protocol so we redirect to https directly.
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) url.protocol = `${proto.split(",")[0].trim()}:`;
  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(loginRedirect(request));
    }

    try {
      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
      await jwtVerify(token, secret);
    } catch {
      const res = NextResponse.redirect(loginRedirect(request));
      res.cookies.delete({ name: "admin_token", path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
