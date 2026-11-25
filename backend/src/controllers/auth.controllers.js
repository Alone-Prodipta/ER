import { randomBytes } from 'node:crypto';
import AuthSession from '../models/authSession.models.js';
import User from '../models/user.models.js';
import { hashPassword, verifyPassword } from '../utilities/passwords.js';
import { hashSessionToken, readSessionToken, SESSION_COOKIE_NAME } from '../middlewares/requireAuth.middlewares.js';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setSessionCookie(res, token) {
  const sameSite = process.env.COOKIE_SAME_SITE;
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: SESSION_DURATION_MS,
  });
}

async function startSession(user, res) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await AuthSession.create({ user: user._id, tokenHash: hashSessionToken(token), expiresAt });
  setSessionCookie(res, token);
}

function publicUser(user) {
  return { id: user._id.toString(), email: user.email };
}

export async function register(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    }
    if (password.length !== 5) {
      return res.status(400).json({ success: false, error: 'Password must be exactly 5 characters.' });
    }

    const user = await User.create({ email, passwordHash: await hashPassword(password) });
    await startSession(user, res);
    return res.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
    }

    await startSession(user, res);
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export function currentUser(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ success: true, user: publicUser(req.user) });
}

export async function logout(req, res, next) {
  try {
    const token = readSessionToken(req);
    if (token) await AuthSession.deleteOne({ tokenHash: hashSessionToken(token) });
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE,
      path: '/',
    });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
