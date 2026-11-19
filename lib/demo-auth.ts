import { decode, encode } from "next-auth/jwt";

export const DEMO_COOKIE = "sentinel-demo";
export const DEMO_MAX_AGE = 8 * 60 * 60;
export const demoEnabled = () =>
  process.env.ENABLE_DEMO === "true" ||
  (process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEMO !== "false");
const secret = () =>
  process.env.DEMO_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "cybersentinel-local-demo-only"
    : "");
export async function createDemoToken() {
  if (!demoEnabled() || !secret())
    throw new Error("Demo access is not configured");
  return encode({
    token: { sub: "demo-analyst", demo: true },
    secret: secret(),
    maxAge: DEMO_MAX_AGE,
  });
}
export async function validDemoToken(token?: string) {
  if (!token || !demoEnabled() || !secret()) return false;
  try {
    const value = await decode({ token, secret: secret() });
    return value?.demo === true && value.sub === "demo-analyst";
  } catch {
    return false;
  }
}
