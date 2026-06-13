import { NextRequest } from "next/server";

/**
 * Resolve an absolute URL for redirects.
 *
 * Behind a reverse proxy the `Host` header (and therefore `request.url`)
 * often reflects the app's internal address (e.g. `localhost:8080`) rather
 * than the public domain. Prefer NEXT_PUBLIC_APP_URL when set, since it's
 * already configured to the deployment's public URL.
 */
export function resolveUrl(path: string, request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (base) {
    // Tolerate a base URL configured without a scheme (e.g. "example.com"),
    // which would otherwise make `new URL()` throw and break the redirect.
    const normalized = /^https?:\/\//i.test(base) ? base : `https://${base}`;
    try {
      return new URL(path, normalized);
    } catch {
      // fall through to request.url below
    }
  }
  return new URL(path, request.url);
}
