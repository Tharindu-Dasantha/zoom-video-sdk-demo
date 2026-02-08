import "server-only";
import { KJUR } from "jsrsasign";

export function getData(slug: string): string {
  if (!slug || slug.trim() === "") {
    throw new Error("Session name is required");
  }

  return generateSignature(slug.trim(), 1);
}

function generateSignature(sessionName: string, role: number): string {
  const sdkKey = process.env.ZOOM_SDK_KEY;
  const sdkSecret = process.env.ZOOM_SDK_SECRET;

  if (!sdkKey || !sdkSecret) {
    throw new Error(
      "Missing ZOOM_SDK_KEY or ZOOM_SDK_SECRET environment variables"
    );
  }

  const iat = Math.round(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload = {
    app_key: sdkKey,
    tpc: sessionName,
    role_type: role,
    version: 1,
    iat,
    exp,
  };

  return KJUR.jws.JWS.sign(
    "HS256",
    JSON.stringify(oHeader),
    JSON.stringify(oPayload),
    sdkSecret
  );
}
