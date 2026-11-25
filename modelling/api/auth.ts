import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.ts";
import { authSessions, users } from "../db/schema.ts";

export const SESSION_COOKIE_NAME = "er_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// The frontend and API share one origin on Netlify, so a strict first-party cookie works.
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NETLIFY_DEV !== "true",
  sameSite: "lax",
  path: "/",
});

export function readSessionToken(req) {
  const cookieHeader = req.headers.cookie || "";
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return entry ? entry.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions());
}

export async function startSession(userId, res) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db.insert(authSessions).values({ userId, tokenHash: hashSessionToken(token), expiresAt });
  res.cookie(SESSION_COOKIE_NAME, token, { ...cookieOptions(), maxAge: SESSION_DURATION_MS });
}

export async function requireAuth(req, res, next) {
  try {
    const token = readSessionToken(req);
    if (!token) return res.status(401).json({ success: false, error: "Please log in to continue." });

    const [row] = await db
      .select({ id: users.id, email: users.email })
      .from(authSessions)
      .innerJoin(users, eq(authSessions.userId, users.id))
      .where(and(eq(authSessions.tokenHash, hashSessionToken(token)), gt(authSessions.expiresAt, new Date())))
      .limit(1);

    if (!row) {
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: "Your session has expired. Please log in again." });
    }

    req.user = row;
    return next();
  } catch (error) {
    return next(error);
  }
}
