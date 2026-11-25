import { createHash } from 'node:crypto';
import AuthSession from '../models/authSession.models.js';

export const SESSION_COOKIE_NAME = 'er_session';

export function readSessionToken(req) {
  const cookieHeader = req.headers.cookie || '';
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return entry ? entry.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export default async function requireAuth(req, res, next) {
  try {
    const token = readSessionToken(req);
    if (!token) return res.status(401).json({ success: false, error: 'Please log in to continue.' });

    const session = await AuthSession.findOne({
      tokenHash: hashSessionToken(token),
      expiresAt: { $gt: new Date() },
    }).populate('user', 'email');

    if (!session?.user) {
      const sameSite = process.env.COOKIE_SAME_SITE || 'lax';
      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
        sameSite,
        path: '/',
      });
      return res.status(401).json({ success: false, error: 'Your session has expired. Please log in again.' });
    }

    req.user = session.user;
    req.authSession = session;
    return next();
  } catch (error) {
    return next(error);
  }
}
