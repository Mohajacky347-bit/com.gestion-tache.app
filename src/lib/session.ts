import crypto from "crypto";
import { AppUserRole } from "@/types/auth";

export interface SessionPayload {
  userId: string;
  role: AppUserRole;
  brigadeId?: number | null;
}

interface InternalSessionPayload extends SessionPayload {
  exp: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-session-secret";
export const SESSION_COOKIE_NAME = "session_token";
export const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h

export function createSessionToken(payload: SessionPayload): string {
  const data: InternalSessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };

  const base = Buffer.from(JSON.stringify(data), "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base)
    .digest("base64url");

  return `${base}.${signature}`;
}

export function parseSessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [base, signature] = token.split(".");
  if (!base || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base)
    .digest("base64url");

  try {
    const bufferSignature = Buffer.from(signature, "base64url");
    const bufferExpected = Buffer.from(expectedSignature, "base64url");
    if (
      bufferSignature.length !== bufferExpected.length ||
      !crypto.timingSafeEqual(bufferSignature, bufferExpected)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const json = Buffer.from(base, "base64url").toString("utf-8");
    const data = JSON.parse(json) as InternalSessionPayload;
    if (Date.now() > data.exp) {
      return null;
    }
    const { exp, ...payload } = data;
    return payload;
  } catch (error) {
    console.error("Invalid session token:", error);
    return null;
  }
}



